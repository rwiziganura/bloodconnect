import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    is_verified: Boolean(row.is_verified),
    created_at: row.created_at,
  };
}

export async function register(req, res) {
  try {
    const { name, email, phone, password, role, donorProfile, hospitalProfile } =
      req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const normalizedRole = String(role || "").toLowerCase();
    if (!["donor", "hospital"].includes(normalizedRole)) {
      return res.status(400).json({ error: "Role must be donor or hospital" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (normalizedRole === "donor") {
      const dp = donorProfile || {};
      if (!dp.blood_type || !BLOOD_TYPES.includes(dp.blood_type)) {
        return res.status(400).json({ error: "Valid donor blood type is required" });
      }
      if (!dp.city?.trim()) {
        return res.status(400).json({ error: "City is required for donors" });
      }
    }

    if (normalizedRole === "hospital") {
      const hp = hospitalProfile || {};
      if (!hp.hospital_name?.trim() || !hp.city?.trim()) {
        return res
          .status(400)
          .json({ error: "Hospital name and city are required" });
      }
    }

    const emailNorm = email.trim().toLowerCase();
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [emailNorm]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const phoneVal = phone?.trim() || null;

    const conn = await pool.getConnection();
    await conn.beginTransaction();
    let userId;
    try {
      const [result] = await conn.query(
        `INSERT INTO users (name, email, phone, password, role, is_verified)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [name.trim(), emailNorm, phoneVal, hash, normalizedRole]
      );
      userId = result.insertId;

      if (normalizedRole === "donor") {
        const dp = donorProfile;
        let lat = null;
        let lng = null;
        if (dp.location_lat != null && dp.location_lat !== "") {
          const n = Number(dp.location_lat);
          if (!Number.isNaN(n)) lat = n;
        }
        if (dp.location_lng != null && dp.location_lng !== "") {
          const n = Number(dp.location_lng);
          if (!Number.isNaN(n)) lng = n;
        }
        const lastDon = dp.last_donation_date || null;
        await conn.query(
          `INSERT INTO donors (user_id, blood_type, city, location_lat, location_lng, is_available, last_donation_date)
           VALUES (?, ?, ?, ?, ?, 1, ?)`,
          [
            userId,
            dp.blood_type,
            dp.city.trim(),
            lat,
            lng,
            lastDon || null,
          ]
        );
      }

      if (normalizedRole === "hospital") {
        const hp = hospitalProfile;
        const addr = hp.address?.trim() || null;
        try {
          await conn.query(
            `INSERT INTO hospitals (user_id, hospital_name, city, address, is_approved)
             VALUES (?, ?, ?, ?, 0)`,
            [userId, hp.hospital_name.trim(), hp.city.trim(), addr]
          );
        } catch (e) {
          if (e.errno === 1054 || e.code === "ER_BAD_FIELD_ERROR") {
            await conn.query(
              `INSERT INTO hospitals (user_id, hospital_name, city, is_approved)
               VALUES (?, ?, ?, 0)`,
              [userId, hp.hospital_name.trim(), hp.city.trim()]
            );
          } else {
            throw e;
          }
        }
      }

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, is_verified, created_at
       FROM users WHERE id = ?`,
      [userId]
    );
    const user = publicUser(rows[0]);
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("\n❌ REGISTER ERROR:");
    console.error("  Message:", err.message);
    console.error("  Code:", err.code);
    console.error("  errno:", err.errno);
    console.error("  SQL State:", err.sqlState);
    console.error("  Full Error:", err);
    console.error("");
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const emailNorm = email.trim().toLowerCase();
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, password, role, is_verified, created_at
       FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [emailNorm]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const row = rows[0];
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = publicUser(row);
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, is_verified, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    console.error("getMe:", err);
    res.status(500).json({ error: "Could not load profile" });
  }
}
