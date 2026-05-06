import pool from "../config/db.js";

export async function getPublicDonorsMap(req, res) {
  let connection;
  try {
    const onlyAvail = req.query.available !== "0";
    let sql = `SELECT d.id, d.blood_type, d.city, d.location_lat, d.location_lng, d.is_available, u.name
       FROM donors d
       INNER JOIN users u ON u.id = d.user_id
       WHERE d.location_lat IS NOT NULL AND d.location_lng IS NOT NULL`;
    const params = [];
    if (onlyAvail) {
      sql += " AND d.is_available = 1";
    }

    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    res.json({ donors: rows });
  } catch (err) {
    console.error("❌ GET PUBLIC DONORS MAP ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
    res.status(500).json({ 
      error: "Could not load donor locations",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getPublicStats(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();

    const [availableResult] = await connection.query(
      "SELECT COUNT(*) AS c FROM donors WHERE is_available = 1"
    );
    const availableDonors = availableResult[0]?.c || 0;

    const [registeredResult] = await connection.query(
      "SELECT COUNT(*) AS c FROM donors"
    );
    const totalDonorsRegistered = registeredResult[0]?.c || 0;

    const [hospitalsResult] = await connection.query(
      "SELECT COUNT(*) AS c FROM hospitals"
    );
    const hospitalsCount = hospitalsResult[0]?.c || 0;

    const [fulfilledResult] = await connection.query(
      "SELECT COUNT(*) AS c FROM blood_requests WHERE status = 'fulfilled'"
    );
    const fulfilledRequests = fulfilledResult[0]?.c || 0;

    const [citiesResult] = await connection.query(
      `SELECT COUNT(DISTINCT TRIM(city)) AS c FROM donors
       WHERE city IS NOT NULL AND TRIM(city) <> ''`
    );
    const citiesCovered = citiesResult[0]?.c || 0;

    const [donorsByBloodType] = await connection.query(
      `SELECT d.blood_type AS blood_type, COUNT(*) AS count
       FROM donors d
       WHERE d.is_available = 1
       GROUP BY d.blood_type
       ORDER BY d.blood_type`
    );

    res.json({
      availableDonors,
      totalDonorsRegistered,
      hospitalsCount,
      fulfilledRequests,
      citiesCovered,
      donorsByBloodType: donorsByBloodType || [],
    });
  } catch (err) {
    console.error("❌ GET PUBLIC STATS ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
    res.status(500).json({ 
      error: "Could not load stats",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getRecentRequestsPublic(req, res) {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      `SELECT br.blood_type, br.urgency, br.created_at, br.quantity_units,
              h.hospital_name, h.city
       FROM blood_requests br
       INNER JOIN hospitals h ON h.id = br.hospital_id
       WHERE br.status = 'open'
       ORDER BY br.created_at DESC
       LIMIT 30`
    );
    res.json({ items: rows });
  } catch (err) {
    console.error("❌ GET RECENT REQUESTS ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  Stack:", err.stack);
    res.status(500).json({ 
      error: "Could not load feed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
