import pool from "../config/db.js";
import { donorTypesCompatibleWithNeed } from "../utils/bloodCompatibility.js";
import { haversineDistanceKm } from "../utils/haversine.js";
import { sendSMS } from "../utils/sendSMS.js";
import { sendEmail } from "../utils/sendEmail.js";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = ["low", "medium", "high", "critical"];
const MAX_NOTIFY = 20;
const RADIUS_KM = 50;

async function getHospitalByUserId(userId) {
  const [[h]] = await pool.query(
    "SELECT * FROM hospitals WHERE user_id = ?",
    [userId]
  );
  return h || null;
}

// Ensures a hospital row exists for this user, creating one if needed.
// Returns the hospital row or throws if the user isn't a hospital.
async function ensureHospital(userId) {
  let hospital = await getHospitalByUserId(userId);
  if (hospital) return hospital;

  // Auto-create using the user's name
  const [[u]] = await pool.query("SELECT name FROM users WHERE id = ?", [userId]);
  const defaultName = u?.name ? `${u.name} Hospital` : "Hospital";

  try {
    await pool.query(
      `INSERT INTO hospitals (user_id, hospital_name, city, address, is_approved)
       VALUES (?, ?, 'Not set', NULL, 0)`,
      [userId, defaultName]
    );
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      await pool.query(
        `INSERT INTO hospitals (user_id, hospital_name, city, is_approved)
         VALUES (?, ?, 'Not set', 0)`,
        [userId, defaultName]
      );
    } else if (err.code !== "ER_DUP_ENTRY") {
      throw err;
    }
  }

  hospital = await getHospitalByUserId(userId);
  return hospital;
}

export async function createRequest(req, res) {
  try {
    console.log("=== CREATE REQUEST ===");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const { blood_type, quantity_units, urgency, notes, patient_name, contact_phone } = req.body;

    if (!blood_type || !BLOOD_TYPES.includes(blood_type)) {
      return res.status(400).json({ error: "Valid blood_type is required" });
    }

    const qty = Math.min(500, Math.max(1, parseInt(quantity_units, 10) || 1));
    const urg = URGENCY_LEVELS.includes(urgency) ? urgency : "medium";
    const userRole = req.user.role;
    let hospitalId = null;
    let requesterId = null;
    let requestType = "personal";

    if (userRole === "hospital") {
      const hospital = await ensureHospital(req.user.id);
      console.log("Hospital lookup:", hospital);
      if (!hospital) {
        return res.status(400).json({ error: "Could not find or create hospital profile" });
      }
      hospitalId = hospital.id;
      requestType = "hospital";
    } else {
      requesterId = req.user.id;
    }

    const compatibleTypes = donorTypesCompatibleWithNeed(blood_type);
    if (compatibleTypes.length === 0) {
      return res.status(400).json({ error: "Invalid blood type" });
    }

    // Build INSERT dynamically so hospital_id is omitted (not just NULL)
    // when this is a personal request — avoids NOT NULL constraint errors
    // on databases that haven't run the migration yet.
    let insertSql, insertParams;
    if (requestType === "hospital") {
      insertSql = `INSERT INTO blood_requests
        (hospital_id, request_type, blood_type, quantity_units, urgency, status, notes, patient_name, contact_phone)
        VALUES (?, 'hospital', ?, ?, ?, 'open', ?, ?, ?)`;
      insertParams = [hospitalId, blood_type, qty, urg, notes || null, patient_name || null, contact_phone || null];
    } else {
      insertSql = `INSERT INTO blood_requests
        (hospital_id, requester_id, request_type, blood_type, quantity_units, urgency, status, notes, patient_name, contact_phone)
        VALUES (NULL, ?, 'personal', ?, ?, ?, 'open', ?, ?, ?)`;
      insertParams = [requesterId, blood_type, qty, urg, notes || null, patient_name || null, contact_phone || null];
    }

    console.log("INSERT SQL:", insertSql);
    console.log("INSERT params:", insertParams);

    let requestId;
    try {
      const [ins] = await pool.query(insertSql, insertParams);
      requestId = ins.insertId;
    } catch (insertErr) {
      console.warn("Full insert failed:", insertErr.sqlMessage || insertErr.message);
      // Columns from migration.sql are missing — try the original minimal schema
      const isMissingColumn = insertErr.code === "ER_BAD_FIELD_ERROR";
      const isNullConstraint = insertErr.code === "ER_BAD_NULL_ERROR";
      if (isMissingColumn || isNullConstraint) {
        return res.status(500).json({
          error: "Database schema is outdated. Please run migration.sql in phpMyAdmin.",
          sqlMessage: insertErr.sqlMessage,
          code: insertErr.code,
          fix: "Run migration.sql from your project root in phpMyAdmin to add: request_type, requester_id, patient_name, contact_phone to blood_requests; and is_read, request_id to notifications.",
        });
      }
      throw insertErr;
    }

    console.log("Request created, id:", requestId);

    // Find matching donors
    const placeholders = compatibleTypes.map(() => "?").join(",");
    const [donorRows] = await pool.query(
      `SELECT d.id AS donor_id, d.user_id, d.blood_type, d.location_lat, d.location_lng,
              u.name AS user_name, u.phone, u.email
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.is_available = 1
         AND d.blood_type IN (${placeholders})
         AND d.user_id != ?`,
      [...compatibleTypes, req.user.id]
    );

    let refLat = null;
    let refLng = null;
    let notifyMessage = "";

    if (userRole === "hospital") {
      const hospital = await getHospitalByUserId(req.user.id);
      refLat = hospital?.location_lat != null ? Number(hospital.location_lat) : null;
      refLng = hospital?.location_lng != null ? Number(hospital.location_lng) : null;
      notifyMessage = `Urgent blood need: ${blood_type} at ${hospital?.hospital_name} (${hospital?.city}). Urgency: ${urg}. Units needed: ${qty}. Open BloodConnect to respond.`;
    } else {
      notifyMessage = `Blood needed: ${blood_type} for patient ${patient_name || "unknown"}. Urgency: ${urg}. Contact: ${contact_phone || "N/A"}. Open BloodConnect to respond.`;
    }

    let candidates = donorRows.map((row) => {
      const dist =
        refLat != null && refLng != null && row.location_lat != null && row.location_lng != null
          ? haversineDistanceKm(refLat, refLng, Number(row.location_lat), Number(row.location_lng))
          : null;
      return { ...row, dist };
    });

    if (refLat != null && refLng != null) {
      candidates = candidates.filter((d) => d.dist != null && d.dist <= RADIUS_KM);
    }

    candidates.sort((a, b) => {
      if (a.dist != null && b.dist != null) return a.dist - b.dist;
      if (a.dist != null) return -1;
      if (b.dist != null) return 1;
      return a.donor_id - b.donor_id;
    });

    const top = candidates.slice(0, MAX_NOTIFY);
    console.log("Donors to notify:", top.length);

    for (const d of top) {
      await pool.query(
        `INSERT IGNORE INTO donor_responses (request_id, donor_id, status, responded_at)
         VALUES (?, ?, 'pending', NULL)`,
        [requestId, d.donor_id]
      );
      // notifications: try with request_id, fall back without it
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, request_id, message, type, status, is_read)
           VALUES (?, ?, ?, 'both', 'unread', FALSE)`,
          [d.user_id, requestId, notifyMessage]
        );
      } catch {
        await pool.query(
          `INSERT INTO notifications (user_id, message, type, status)
           VALUES (?, ?, 'both', 'unread')`,
          [d.user_id, notifyMessage]
        );
      }
    }

    await pool.query(
      "UPDATE blood_requests SET donors_notified_count = ? WHERE id = ?",
      [top.length, requestId]
    );

    await Promise.allSettled(
      top.map(async (d) => {
        await sendSMS(d.phone, notifyMessage);
        if (d.email) {
          await sendEmail(d.email, "Urgent blood request — BloodConnect", notifyMessage);
        }
      })
    );

    console.log("=== REQUEST COMPLETE ===");
    res.status(201).json({
      donorsNotified: top.length,
      notifiedDonorIds: top.map((t) => t.donor_id),
    });
  } catch (err) {
    console.error("CREATE REQUEST ERROR DETAILS:");
    console.error("Message:", err.message);
    console.error("Code:", err.code);
    console.error("SQL:", err.sql);
    console.error("SQLMessage:", err.sqlMessage);
    res.status(500).json({
      error: "Failed to create request",
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
  }
}

export async function getAllRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT br.*,
       h.hospital_name, h.city,
       u.name AS requester_name
       FROM blood_requests br
       LEFT JOIN hospitals h ON h.id = br.hospital_id
       LEFT JOIN users u ON u.id = br.requester_id
       WHERE br.status = 'open'
       ORDER BY
         FIELD(br.urgency, 'critical', 'high', 'medium', 'low'),
         br.created_at DESC`
    );
    // Normalise: personal requests use requester_name as display name
    const requests = rows.map(r => ({
      ...r,
      hospital_name: r.hospital_name || r.requester_name || 'Personal Request',
      city: r.city || null,
    }));
    res.json({ requests });
  } catch (err) {
    console.error("getAllRequests:", err);
    res.status(500).json({ error: "Could not load requests", details: err.message });
  }
}

export async function getRequestById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }
    const [rows] = await pool.query(
      `SELECT br.*, h.hospital_name, h.city, h.location_lat, h.location_lng
       FROM blood_requests br
       LEFT JOIN hospitals h ON h.id = br.hospital_id
       WHERE br.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ request: rows[0] });
  } catch (err) {
    console.error("getRequestById:", err);
    res.status(500).json({ error: "Could not load request", details: err.message });
  }
}

export async function getHospitalRequests(req, res) {
  try {
    const hospital = await ensureHospital(req.user.id);
    if (!hospital) {
      return res.status(400).json({ error: "Could not find or create hospital profile" });
    }

    const [rows] = await pool.query(
      `SELECT br.*,
        (SELECT COUNT(*) FROM donor_responses dr
         WHERE dr.request_id = br.id AND dr.status = 'accepted') AS accepted_count
       FROM blood_requests br
       WHERE br.hospital_id = ?
       ORDER BY br.created_at DESC`,
      [hospital.id]
    );
    res.json({ requests: rows });
  } catch (err) {
    console.error("getHospitalRequests:", err);
    res.status(500).json({ error: "Could not load hospital requests" });
  }
}

export async function getRequestDonors(req, res) {
  try {
    const { id } = req.params;
    
    console.log('Getting donors for request:', id);

    const [donors] = await pool.query(
      `SELECT 
        dr.id,
        dr.status,
        dr.donor_weight,
        dr.donor_age,
        dr.donor_email,
        dr.donor_phone,
        dr.medical_conditions,
        dr.responded_at,
        u.name as donor_name,
        u.phone as user_phone,
        u.email as user_email,
        d.blood_type,
        d.city,
        d.id as donor_id
       FROM donor_responses dr
       JOIN donors d ON dr.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE dr.request_id = ?
       ORDER BY 
         CASE dr.status 
           WHEN 'accepted' THEN 1
           WHEN 'notified' THEN 2
           WHEN 'declined' THEN 3
           ELSE 4
         END`,
      [id]
    );

    console.log('Donors found:', donors.length);
    console.log('Donors data:', donors);

    res.json({ donors });

  } catch (error) {
    console.error('GET DONORS ERROR:', error);
    res.status(500).json({ 
      message: error.message 
    });
  }
}

export async function getRequestDonorResponses(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const hospital = await ensureHospital(req.user.id);
    if (!hospital) {
      return res.status(400).json({ error: "Could not find or create hospital profile" });
    }

    const [[reqRow]] = await pool.query(
      "SELECT id FROM blood_requests WHERE id = ? AND hospital_id = ?",
      [id, hospital.id]
    );
    if (!reqRow) {
      return res.status(404).json({ error: "Request not found" });
    }

    const [rows] = await pool.query(
      `SELECT dr.status, dr.responded_at,
              d.blood_type, d.city, d.location_lat, d.location_lng,
              u.name AS donor_name,
              h.location_lat AS h_lat, h.location_lng AS h_lng
       FROM donor_responses dr
       INNER JOIN donors d ON d.id = dr.donor_id
       INNER JOIN users u ON u.id = d.user_id
       INNER JOIN blood_requests br ON br.id = dr.request_id
       INNER JOIN hospitals h ON h.id = br.hospital_id
       WHERE dr.request_id = ?`,
      [id]
    );

    const enriched = rows.map((r) => {
      let distanceKm = null;
      if (
        r.h_lat != null &&
        r.h_lng != null &&
        r.location_lat != null &&
        r.location_lng != null
      ) {
        distanceKm = haversineDistanceKm(
          Number(r.h_lat),
          Number(r.h_lng),
          Number(r.location_lat),
          Number(r.location_lng)
        );
      }
      return {
        donor_name: r.donor_name,
        blood_type: r.blood_type,
        city: r.city,
        status: r.status,
        responded_at: r.responded_at,
        distance_km: distanceKm,
      };
    });

    res.json({ donors: enriched });
  } catch (err) {
    console.error("getRequestDonorResponses:", err);
    res.status(500).json({ error: "Could not load donor responses" });
  }
}

export async function updateRequestStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const { status } = req.body;
    if (!["open", "fulfilled", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [[row]] = await pool.query(
      `SELECT br.id FROM blood_requests br
       INNER JOIN hospitals h ON h.id = br.hospital_id
       WHERE br.id = ? AND h.user_id = ?`,
      [id, req.user.id]
    );
    if (!row) {
      return res.status(404).json({ error: "Request not found" });
    }

    await pool.query("UPDATE blood_requests SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    const [[updated]] = await pool.query(
      "SELECT * FROM blood_requests WHERE id = ?",
      [id]
    );
    res.json({ request: updated });
  } catch (err) {
    console.error("updateRequestStatus:", err);
    res.status(500).json({ error: "Could not update request" });
  }
}

export async function respondToRequest(req, res) {
  try {
    const donorUserId = req.user.id;
    const { id: requestId } = req.params;
    
    console.log('RESPOND TO REQUEST:');
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    const { 
      status,
      donor_weight,
      donor_age,
      donor_email,
      donor_phone,
      medical_conditions
    } = req.body;

    const [donorRows] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [donorUserId]
    );

    if (!donorRows.length) {
      return res.status(404).json({
        message: 'Donor profile not found'
      });
    }

    const donorId = donorRows[0].id;

    console.log('Updating donor_response:', {
      status, donor_weight, donor_age,
      donor_email, donor_phone,
      requestId, donorId
    });

    const [existing] = await pool.query(
      `SELECT id FROM donor_responses 
       WHERE request_id = ? AND donor_id = ?`,
      [requestId, donorId]
    );

    console.log('Existing response:', existing);

    if (existing.length) {
      await pool.query(
        `UPDATE donor_responses 
         SET status = ?,
             donor_weight = ?,
             donor_age = ?,
             donor_email = ?,
             donor_phone = ?,
             medical_conditions = ?
         WHERE request_id = ? AND donor_id = ?`,
        [
          status,
          donor_weight || null,
          donor_age || null,
          donor_email || null,
          donor_phone || null,
          medical_conditions || null,
          requestId,
          donorId
        ]
      );
      console.log('Updated existing response');
    } else {
      await pool.query(
        `INSERT INTO donor_responses
         (request_id, donor_id, status,
          donor_weight, donor_age, donor_email,
          donor_phone, medical_conditions)
         VALUES (?,?,?,?,?,?,?,?)`,
        [
          requestId, donorId, status,
          donor_weight || null,
          donor_age || null,
          donor_email || null,
          donor_phone || null,
          medical_conditions || null
        ]
      );
      console.log('Inserted new response');
    }

    if (status === 'accepted') {
      const [donorInfo] = await pool.query(
        `SELECT u.name, u.phone, u.email,
         d.blood_type, d.city
         FROM users u
         JOIN donors d ON d.user_id = u.id
         WHERE u.id = ?`,
        [donorUserId]
      );

      const [requestInfo] = await pool.query(
        `SELECT br.*, 
         h.user_id as hospital_user_id,
         h.hospital_name
         FROM blood_requests br
         LEFT JOIN hospitals h 
           ON br.hospital_id = h.id
         WHERE br.id = ?`,
        [requestId]
      );

      console.log('Request info:', requestInfo[0]);

      if (requestInfo.length && 
          requestInfo[0].hospital_user_id) {
        
        const hospitalUserId = 
          requestInfo[0].hospital_user_id;
        const name = donorInfo[0]?.name;
        const phone = donor_phone || 
          donorInfo[0]?.phone;
        const email = donor_email || 
          donorInfo[0]?.email;
        const bloodType = donorInfo[0]?.blood_type;
        const city = donorInfo[0]?.city;
        const weight = donor_weight || 'Not provided';
        const age = donor_age || 'Not provided';
        const medical = medical_conditions 
          || 'None';

        await pool.query(
          `INSERT INTO notifications
           (user_id, request_id, message, type, status, is_read)
           VALUES (?, ?, ?, 'both', 'unread', FALSE)`,
          [
            hospitalUserId,
            requestId,
            `Donor ${name} accepted your blood request. Blood type: ${bloodType}, Phone: ${phone}, Email: ${email}, Age: ${age} years, Weight: ${weight} kg, City: ${city}, Medical conditions: ${medical}. Please contact them to confirm donation location and time.`
          ]
        );
        console.log('Hospital notified:', 
          hospitalUserId);
      }
    }

    res.json({ 
      message: 'Response recorded', 
      status 
    });

  } catch (error) {
    console.error('RESPOND ERROR:', error);
    res.status(500).json({ 
      message: error.message 
    });
  }
}
