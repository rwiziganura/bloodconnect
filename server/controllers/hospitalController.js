import pool from "../config/db.js";

export async function getHospitalProfile(req, res) {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    connection = await pool.getConnection();

    let [rows] = await connection.query(
      `SELECT h.id, h.user_id, h.hospital_name, h.city, h.address, h.location_lat, h.location_lng,
              h.is_approved, u.name AS contact_name, u.email AS contact_email, u.phone AS contact_phone
       FROM hospitals h
       INNER JOIN users u ON u.id = h.user_id
       WHERE h.user_id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      // Auto-create a hospital row for this user
      const [[u]] = await connection.query("SELECT name FROM users WHERE id = ?", [req.user.id]);
      const defaultName = u?.name ? `${u.name} Hospital` : "Hospital";

      // Try INSERT with address column first; fall back to without it
      try {
        await connection.query(
          `INSERT INTO hospitals (user_id, hospital_name, city, address, is_approved)
           VALUES (?, ?, 'Not set', NULL, 0)`,
          [req.user.id, defaultName]
        );
      } catch (insertErr) {
        if (insertErr.code === "ER_BAD_FIELD_ERROR") {
          // address column doesn't exist yet — insert without it
          await connection.query(
            `INSERT INTO hospitals (user_id, hospital_name, city, is_approved)
             VALUES (?, ?, 'Not set', 0)`,
            [req.user.id, defaultName]
          );
        } else {
          throw insertErr;
        }
      }

      [rows] = await connection.query(
        `SELECT h.id, h.user_id, h.hospital_name, h.city,
                h.location_lat, h.location_lng, h.is_approved,
                u.name AS contact_name, u.email AS contact_email, u.phone AS contact_phone
         FROM hospitals h
         INNER JOIN users u ON u.id = h.user_id
         WHERE h.user_id = ?`,
        [req.user.id]
      );
    }

    res.json({ hospital: rows[0] });
  } catch (err) {
    console.error("❌ GET HOSPITAL PROFILE ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
    res.status(500).json({ 
      error: "Could not load hospital profile",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function updateHospitalProfile(req, res) {
  let connection;
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { hospital_name, city, address, location_lat, location_lng } = req.body;

    connection = await pool.getConnection();

    const [[existing]] = await connection.query(
      "SELECT id FROM hospitals WHERE user_id = ?",
      [req.user.id]
    );
    if (!existing) {
      return res.status(404).json({ error: "Hospital profile not found" });
    }

    const nameVal =
      typeof hospital_name === "string" && hospital_name.trim()
        ? hospital_name.trim()
        : null;
    const cityVal =
      typeof city === "string" && city.trim() ? city.trim() : null;

    let latVal = null;
    let lngVal = null;
    if (location_lat !== undefined && location_lat !== null && location_lat !== "") {
      const n = Number(location_lat);
      if (!Number.isNaN(n)) latVal = n;
    }
    if (location_lng !== undefined && location_lng !== null && location_lng !== "") {
      const n = Number(location_lng);
      if (!Number.isNaN(n)) lngVal = n;
    }

    const updates = [];
    const params = [];
    if (nameVal !== null) {
      updates.push("hospital_name = ?");
      params.push(nameVal);
    }
    if (cityVal !== null) {
      updates.push("city = ?");
      params.push(cityVal);
    }
    if (location_lat !== undefined) {
      updates.push("location_lat = ?");
      params.push(latVal);
    }
    if (location_lng !== undefined) {
      updates.push("location_lng = ?");
      params.push(lngVal);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      params.push(
        typeof address === "string" && address.trim() ? address.trim() : null
      );
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    params.push(req.user.id);
    await connection.query(
      `UPDATE hospitals SET ${updates.join(", ")} WHERE user_id = ?`,
      params
    );

    const [[hospital]] = await connection.query(
      `SELECT h.id, h.user_id, h.hospital_name, h.city, h.address, h.location_lat, h.location_lng,
              h.is_approved, u.name AS contact_name, u.email AS contact_email, u.phone AS contact_phone
       FROM hospitals h
       INNER JOIN users u ON u.id = h.user_id
       WHERE h.user_id = ?`,
      [req.user.id]
    );

    res.json({ hospital });
  } catch (err) {
    console.error("❌ UPDATE HOSPITAL PROFILE ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
    res.status(500).json({ 
      error: "Could not update hospital profile",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
