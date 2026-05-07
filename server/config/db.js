import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

console.log('🔧 Configuring TiDB Cloud connection...');
console.log('   Host:', process.env.DB_HOST);
console.log('   Port:', process.env.DB_PORT);
console.log('   User:', process.env.DB_USER);
console.log('   Database:', process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Simplified SSL for TiDB Cloud
  ssl: {},
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err.message);
});

const testConnection = async () => {
  try {
    console.log('🔌 Testing database connection...');
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('✅ TiDB Cloud connected successfully!');
    console.log('   Database:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ DB Connection failed:', err.message);
    console.error('   Code:', err.code);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check TiDB Cloud cluster is running at https://tidbcloud.com/console/clusters');
    console.error('   2. Verify password in .env file');
    console.error('   3. Check IP whitelist allows your IP');
    console.error('');
  }
};

testConnection();
export default pool;
