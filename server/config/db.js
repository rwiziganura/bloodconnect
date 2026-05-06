import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
  idleTimeout: 60000
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✓ TiDB Cloud connected');
    conn.release();
  } catch (err) {
    console.error('✗ DB Connection failed:', err.message);
    console.error('Code:', err.code);
  }
};

testConnection();
export default pool;
