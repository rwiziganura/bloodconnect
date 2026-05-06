import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import donorAcceptanceRoutes from "./routes/donorAcceptanceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✓ Database connected: ${process.env.DB_NAME} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  } catch (err) {
    console.error('✗ Database connection failed at startup:');
    console.error(`  Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`  User: ${process.env.DB_USER || 'root'}`);
    console.error(`  Database: ${process.env.DB_NAME || 'bloodconnect'}`);
    console.error(`  Error: ${err.message}`);
    console.error(`  Code: ${err.code}`);
  }
})();

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/donor-acceptance", donorAcceptanceRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "BloodConnect API is running" });
});

app.get("/api/db/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, database: process.env.DB_NAME, result: rows[0] });
  } catch (err) {
    console.error("Database ping failed:", err.message);
    res.status(500).json({
      ok: false,
      error: "Database connection failed",
      details: err.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("\n❌ EXPRESS ERROR MIDDLEWARE:");
  console.error("  Message:", err.message);
  console.error("  Stack:", err.stack);
  console.error("");
  res.status(err.status || 500).json({ 
    error: err.message || "Internal server error",
    message: err.message 
  });
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('\n❌ UNCAUGHT EXCEPTION:');
  console.error('  Message:', error.message);
  console.error('  Stack:', error.stack);
  console.error('');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ UNHANDLED REJECTION:');
  console.error('  Reason:', reason);
  console.error('  Promise:', promise);
  console.error('');
});

app.listen(PORT, () => {
  console.log(`BloodConnect server listening on http://localhost:${PORT}`);
});
