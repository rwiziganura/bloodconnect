import pool from "../config/db.js";
import { sendSMS } from "../utils/sendSMS.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_verified, u.created_at,
              d.id AS donor_profile_id,
              h.id AS hospital_id, h.hospital_name, h.city AS hospital_city,
              h.is_approved AS hospital_is_approved
       FROM users u
       LEFT JOIN donors d ON d.user_id = u.id
       LEFT JOIN hospitals h ON h.user_id = u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ users: rows });
  } catch (err) {
    console.error("❌ getAllUsers ERROR:", err.message, err);
    res.status(500).json({ error: "Could not load users", details: err.message });
  }
}

export async function rejectHospital(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid hospital id" });
    }

    const [[h]] = await pool.query(
      "SELECT user_id FROM hospitals WHERE id = ? AND is_approved = 0",
      [id]
    );
    if (!h) {
      return res.status(404).json({ error: "Pending hospital not found" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [h.user_id]);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ rejectHospital ERROR:", err.message, err);
    res.status(500).json({ error: "Could not reject hospital", details: err.message });
  }
}

export async function approveHospital(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid hospital id" });
    }

    const [result] = await pool.query(
      "UPDATE hospitals SET is_approved = 1 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    const [[hospital]] = await pool.query(
      `SELECT h.*, u.email, u.name AS contact_name
       FROM hospitals h
       INNER JOIN users u ON u.id = h.user_id
       WHERE h.id = ?`,
      [id]
    );
    res.json({ hospital });
  } catch (err) {
    console.error("❌ approveHospital ERROR:", err.message, err);
    res.status(500).json({ error: "Could not approve hospital", details: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (id === req.user.id) {
      return res.status(403).json({ error: "You cannot delete your own account" });
    }

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ deleteUser ERROR:", err.message, err);
    res.status(500).json({ error: "Could not delete user", details: err.message });
  }
}

export async function getStats(req, res) {
  try {
    const [totalDonorsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM donors"
    );
    const totalDonors = totalDonorsResult[0]?.c || 0;

    const [totalHospitalsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM hospitals"
    );
    const totalHospitals = totalHospitalsResult[0]?.c || 0;

    const [totalRequestsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM blood_requests"
    );
    const totalRequests = totalRequestsResult[0]?.c || 0;

    const [fulfilledRequestsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM blood_requests WHERE status = 'fulfilled'"
    );
    const fulfilledRequests = fulfilledRequestsResult[0]?.c || 0;

    const successRate =
      totalRequests > 0
        ? Math.round((fulfilledRequests / totalRequests) * 100)
        : 0;

    const [requestsOverTime] = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM blood_requests
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    const [pendingHospitals] = await pool.query(
      `SELECT h.id, h.hospital_name, h.city, u.name AS contact_name, u.email, u.created_at AS registered_at
       FROM hospitals h
       INNER JOIN users u ON u.id = h.user_id
       WHERE h.is_approved = 0
       ORDER BY h.id ASC`
    );

    const [pendingApprovalsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM hospitals WHERE is_approved = 0"
    );
    const pendingApprovals = pendingApprovalsResult[0]?.c || 0;

    const [activeAlertsResult] = await pool.query(
      "SELECT COUNT(*) AS c FROM blood_requests WHERE status = 'open'"
    );
    const activeAlerts = activeAlertsResult[0]?.c || 0;

    const [requestsByBloodType] = await pool.query(
      `SELECT blood_type AS name, COUNT(*) AS value
       FROM blood_requests
       GROUP BY blood_type`
    );

    const [donorsByCity] = await pool.query(
      `SELECT city AS name, COUNT(*) AS value
       FROM donors
       WHERE city IS NOT NULL AND TRIM(city) <> ''
       GROUP BY city
       ORDER BY value DESC
       LIMIT 12`
    );

    const [requestsOverTime30] = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM blood_requests
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    res.json({
      totalDonors,
      totalHospitals,
      totalRequests,
      fulfilledRequests,
      successRate,
      requestsOverTime,
      requestsOverTime30,
      pendingHospitals,
      pendingApprovals,
      activeAlerts,
      requestsByBloodType,
      donorsByCity,
    });
  } catch (err) {
    console.error("❌ getStats ERROR:", err.message, err);
    res.status(500).json({ error: "Could not load admin stats", details: err.message });
  }
}

export async function broadcastMessage(req, res) {
  try {
    const { message, subject, target } = req.body;
    const text =
      typeof message === "string" ? message.trim() : "";
    if (text.length < 5) {
      return res
        .status(400)
        .json({ error: "Message must be at least 5 characters" });
    }
    if (text.length > 2000) {
      return res.status(400).json({ error: "Message is too long (max 2000)" });
    }

    const emailSubject =
      typeof subject === "string" && subject.trim()
        ? subject.trim().slice(0, 200)
        : "Message from BloodConnect";

    const tgt = String(target || "donors").toLowerCase();
    let recipients = [];

    if (tgt === "hospitals") {
      const [rows] = await pool.query(
        `SELECT u.id AS user_id, u.phone, u.email, u.name
         FROM hospitals h
         INNER JOIN users u ON u.id = h.user_id`
      );
      recipients = rows;
    } else if (tgt === "all" || tgt === "everyone") {
      const [rows] = await pool.query(
        `SELECT id AS user_id, phone, email, name FROM users WHERE role IN ('donor','hospital')`
      );
      recipients = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT u.id AS user_id, u.phone, u.email, u.name
         FROM donors d
         INNER JOIN users u ON u.id = d.user_id
         WHERE d.is_available = 1`
      );
      recipients = rows;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const d of recipients) {
        await conn.query(
          `INSERT INTO notifications (user_id, message, type, status)
           VALUES (?, ?, 'admin_broadcast', 'unread')`,
          [d.user_id, text]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      conn.release();
      throw e;
    }
    conn.release();

    const channel = String(req.body.channel || "both").toLowerCase();
    const sendSmsChannel = channel === "sms" || channel === "both";
    const sendEmailChannel = channel === "email" || channel === "both";

    const results = await Promise.allSettled(
      recipients.map(async (d) => {
        let sms = { skipped: !sendSmsChannel || !d.phone };
        if (sendSmsChannel && d.phone) {
          sms = await sendSMS(d.phone, text);
        }
        let email = { skipped: !sendEmailChannel || !d.email };
        if (sendEmailChannel && d.email) {
          email = await sendEmail(d.email, emailSubject, text);
        }
        return { sms, email };
      })
    );

    const failed = results.filter((r) => r.status === "rejected").length;

    res.json({
      reached: recipients.length,
      notificationsWritten: recipients.length,
      deliveryAttempts: results.length,
      failed,
    });
  } catch (err) {
    console.error("broadcastMessage:", err);
    res.status(500).json({ error: "Broadcast failed" });
  }
}
