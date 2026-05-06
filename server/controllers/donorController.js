import pool from "../config/db.js";
import { requestTypesMatchableByDonor } from "../utils/bloodCompatibility.js";
import { haversineDistanceKm } from "../utils/haversine.js";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export async function getDonorDashboard(req, res) {
  try {
    const [[donor]] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.user_id = ?`,
      [req.user.id]
    );
    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    const [timesDonatedResult] = await pool.query(
      `SELECT COUNT(*) AS c FROM donor_responses
       WHERE donor_id = ? AND status IN ('completed', 'accepted')`,
      [donor.id]
    );
    const timesDonated = timesDonatedResult[0]?.c || 0;

    const [requestsReceivedResult] = await pool.query(
      `SELECT COUNT(*) AS c FROM donor_responses WHERE donor_id = ?`,
      [donor.id]
    );
    const requestsReceived = requestsReceivedResult[0]?.c || 0;

    const [livesHelpedResult] = await pool.query(
      `SELECT COUNT(*) AS c FROM donor_responses
       WHERE donor_id = ? AND status IN ('accepted', 'completed')`,
      [donor.id]
    );
    const livesHelped = livesHelpedResult[0]?.c || 0;

    res.json({
      donor,
      stats: {
        timesDonated,
        requestsReceived,
        livesHelped,
        lastDonation: donor.last_donation_date,
      },
    });
  } catch (err) {
    console.error("❌ getDonorDashboard ERROR:", err.message, err);
    res.status(500).json({ error: "Could not load donor dashboard", details: err.message });
  }
}

export async function updateDonorAvailability(req, res) {
  try {
    const { is_available } = req.body;
    const val = is_available === true || is_available === 1 || is_available === "1" ? 1 : 0;
    const [[donor]] = await pool.query(
      "SELECT id FROM donors WHERE user_id = ?",
      [req.user.id]
    );
    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }
    await pool.query("UPDATE donors SET is_available = ? WHERE id = ?", [
      val,
      donor.id,
    ]);
    const [[updated]] = await pool.query(
      "SELECT id, is_available FROM donors WHERE id = ?",
      [donor.id]
    );
    res.json({ donor: updated });
  } catch (err) {
    console.error("❌ updateDonorAvailability ERROR:", err.message, err);
    res.status(500).json({ error: "Could not update availability", details: err.message });
  }
}

export async function getDonorAlerts(req, res) {
  try {
    const [[donor]] = await pool.query(
      `SELECT * FROM donors WHERE user_id = ?`,
      [req.user.id]
    );
    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    const matchable = requestTypesMatchableByDonor(donor.blood_type);
    if (matchable.length === 0) {
      return res.json({ alerts: [] });
    }

    const placeholders = matchable.map(() => "?").join(",");
    const [rows] = await pool.query(
      `SELECT br.*, h.hospital_name, h.city, h.location_lat AS h_lat, h.location_lng AS h_lng
       FROM blood_requests br
       INNER JOIN hospitals h ON h.id = br.hospital_id
       WHERE br.status = 'open'
         AND br.blood_type IN (${placeholders})`,
      matchable
    );

    const dLat = donor.location_lat != null ? Number(donor.location_lat) : null;
    const dLng = donor.location_lng != null ? Number(donor.location_lng) : null;

    const alerts = rows.map((r) => {
      let distanceKm = null;
      if (
        dLat != null &&
        dLng != null &&
        r.h_lat != null &&
        r.h_lng != null
      ) {
        distanceKm = haversineDistanceKm(
          dLat,
          dLng,
          Number(r.h_lat),
          Number(r.h_lng)
        );
      }
      return {
        id: r.id,
        blood_type: r.blood_type,
        quantity_units: r.quantity_units,
        urgency: r.urgency,
        notes: r.notes,
        created_at: r.created_at,
        hospital_name: r.hospital_name,
        city: r.city,
        distance_km: distanceKm,
        time_ago: timeAgo(r.created_at),
      };
    });

    alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ alerts });
  } catch (err) {
    console.error("❌ getDonorAlerts ERROR:", err.message, err);
    res.status(500).json({ error: "Could not load alerts", details: err.message });
  }
}

export async function getDonorProfile(req, res) {
  try {
    const [[donor]] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone,
       u.created_at AS member_since
       FROM donors d
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = ?`,
      [req.user.id]
    );
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });
    res.json({ donor });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function updateDonorProfile(req, res) {
  try {
    const { name, phone, blood_type, city, location_lat, location_lng, last_donation_date } = req.body;
    await pool.query(
      "UPDATE users SET name = ?, phone = ? WHERE id = ?",
      [name, phone, req.user.id]
    );
    await pool.query(
      `UPDATE donors SET blood_type = ?, city = ?,
       location_lat = ?, location_lng = ?, last_donation_date = ?
       WHERE user_id = ?`,
      [blood_type, city, location_lat || null, location_lng || null, last_donation_date || null, req.user.id]
    );
    const [[donor]] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone,
       u.created_at AS member_since
       FROM donors d
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = ?`,
      [req.user.id]
    );
    res.json({ message: "Profile updated successfully", donor });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function toggleAvailability(req, res) {
  try {
    const [[donor]] = await pool.query(
      "SELECT id, is_available FROM donors WHERE user_id = ?",
      [req.user.id]
    );
    if (!donor) return res.status(404).json({ message: "Donor not found" });
    const newStatus = !donor.is_available;
    await pool.query("UPDATE donors SET is_available = ? WHERE id = ?", [newStatus, donor.id]);
    res.json({ message: "Availability updated", is_available: newStatus });
  } catch (err) {
    console.error("TOGGLE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getDonorHistory(req, res) {
  try {
    const [[donor]] = await pool.query(
      "SELECT id FROM donors WHERE user_id = ?",
      [req.user.id]
    );
    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(5, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT dr.status, dr.responded_at, br.blood_type, br.created_at AS request_created,
              h.hospital_name, h.city
       FROM donor_responses dr
       INNER JOIN blood_requests br ON br.id = dr.request_id
       INNER JOIN hospitals h ON h.id = br.hospital_id
       WHERE dr.donor_id = ?
       ORDER BY dr.responded_at DESC, br.created_at DESC
       LIMIT ? OFFSET ?`,
      [donor.id, limit, offset]
    );

    const [totalResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM donor_responses WHERE donor_id = ?",
      [donor.id]
    );
    const total = totalResult[0]?.c || 0;

    res.json({
      history: rows,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    console.error("❌ getDonorHistory ERROR:", err.message, err);
    res.status(500).json({ error: "Could not load history", details: err.message });
  }
}
