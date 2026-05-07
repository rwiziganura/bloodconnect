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

// Crash protection - MUST be at the very top
process.on('uncaughtException', (error) => {
  console.error('CRASH:', error.message);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('REJECTION:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ TRUST PROXY (important for Render/Vercel)
app.set('trust proxy', 1);

// ✅ Production + Development CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',

  // Old Vercel URL
  'https://bloodconnect.vercel.app',

  // Current Vercel frontend
  'https://bloodconnect-lac.vercel.app',

  // Optional extra frontend
  'https://bloodconnect-frontend.vercel.app',

  // Dynamic frontend URL from env
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Allowed Origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests with no origin
    // (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS BLOCKED: ${origin}`);

      callback(new Error(
        `CORS blocked for origin: ${origin}`
      ));
    }
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],

  credentials: true,

  optionsSuccessStatus: 200
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Handle preflight requests
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path}`);
  console.log(`   Body:`, JSON.stringify(req.body));
  next();
});

// ✅ Test database connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✅ Database connected: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  } catch (err) {
    console.error('❌ Database connection failed at startup:');
    console.error(`   Host: ${process.env.DB_HOST}`);
    console.error(`   User: ${process.env.DB_USER}`);
    console.error(`   Database: ${process.env.DB_NAME}`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
  }
})();

// Simple health check
app.get("/api/simple-test", (req, res) => {
  res.json({ ok: true, message: "Server is responding" });
});

// ✅ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    ok: true, 
    message: "BloodConnect API is running",
    timestamp: new Date().toISOString()
  });
});

// ✅ Database ping endpoint
app.get("/api/db/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ 
      ok: true, 
      database: process.env.DB_NAME, 
      result: rows[0] 
    });
  } catch (err) {
    console.error("❌ Database ping failed:", err.message);
    res.status(500).json({
      ok: false,
      error: "Database connection failed",
      details: err.message,
    });
  }
});

// 🧪 Test route for debugging registration
app.post('/api/test-register', async (req, res) => {
  let connection;
  try {
    console.log('🧪 Test register called');
    console.log('   Body:', req.body);
    
    connection = await pool.getConnection();
    
    // Test 1: DB connection
    const [test] = await connection.query('SELECT 1 + 1 AS result');
    console.log('   ✅ DB works:', test);
    
    // Test 2: Users table
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('   ✅ Users count:', users[0].count);
    
    // Test 3: Check all tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('   ✅ Tables:', tables.map(t => Object.values(t)[0]));
    
    // Test 4: Check users table structure
    const [userCols] = await connection.query('DESCRIBE users');
    console.log('   ✅ Users columns:', userCols.map(c => c.Field));
    
    // Test 5: Check hospitals table structure
    const [hospitalCols] = await connection.query('DESCRIBE hospitals');
    console.log('   ✅ Hospitals columns:', hospitalCols.map(c => c.Field));
    
    // Test 6: Check donors table structure
    const [donorCols] = await connection.query('DESCRIBE donors');
    console.log('   ✅ Donors columns:', donorCols.map(c => c.Field));
    
    res.json({
      message: 'Test passed',
      dbWorks: true,
      usersCount: users[0].count,
      tables: tables.map(t => Object.values(t)[0]),
      userColumns: userCols.map(c => c.Field),
      hospitalColumns: hospitalCols.map(c => c.Field),
      donorColumns: donorCols.map(c => c.Field),
      body: req.body
    });
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
    console.error('   Code:', error.code);
    console.error('   SQL:', error.sql);
    res.status(500).json({
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
  } finally {
    if (connection) connection.release();
  }
});

// 🔍 Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, prefix = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        const path = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\\/g, '/')
          .replace('^', '')
          .replace('$', '');
        extractRoutes(layer.handle.stack, prefix + path);
      }
    });
  }
  
  extractRoutes(app._router.stack);
  res.json({ routes: routes.sort() });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/donor-acceptance", donorAcceptanceRoutes);

// ✅ 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Not found",
    path: req.path 
  });
});

// ✅ Global error handler (MUST be last middleware)
app.use((err, req, res, next) => {
  console.error("\n❌ EXPRESS ERROR HANDLER:");
  console.error("   Path:", req.path);
  console.error("   Method:", req.method);
  console.error("   Message:", err.message);
  console.error("   Status:", err.status || 500);
  console.error("   Stack:", err.stack);
  console.error("");

  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    message: err.message,
    path: req.path,
  });
});

// ✅ CRITICAL: Prevent server crashes
process.on('SIGTERM', async () => {
  console.log('\n⚠️  SIGTERM received, closing server gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received, closing server gracefully...');
  await pool.end();
  process.exit(0);
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BloodConnect server listening on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Ready to accept requests!\n`);
});

// ✅ Handle server errors
server.on('error', (error) => {
  console.error('\n❌ SERVER ERROR:');
  console.error('   Message:', error.message);
  console.error('   Code:', error.code);
  console.error('');
  
  if (error.code === 'EADDRINUSE') {
    console.error(`   Port ${PORT} is already in use`);
    console.error(`   Try: kill -9 $(lsof -ti:${PORT})`);
  }
});

export default app;
