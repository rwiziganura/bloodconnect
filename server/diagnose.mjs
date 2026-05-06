import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'bloodconnect',
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function diagnose() {
  console.log('\n🔍 BLOODCONNECT DATABASE DIAGNOSTIC\n');
  console.log('Connection Info:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log('');

  try {
    const conn = await pool.getConnection();
    
    // Test connection
    console.log('✓ Connected to database');
    console.log(`✓ Current database: ${process.env.DB_NAME}`);
    
    // List all tables
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log(`\n📋 Tables found (${tableNames.length}):`);
    tableNames.forEach(t => console.log(`  - ${t}`));
    
    // Check users table structure
    console.log('\n📊 USERS table columns:');
    const [userCols] = await conn.query('DESCRIBE users');
    userCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check users count
    const [[{ userCount }]] = await conn.query('SELECT COUNT(*) as userCount FROM users');
    console.log(`\n👥 Users in database: ${userCount}`);
    
    // Check donors table structure
    console.log('\n📊 DONORS table columns:');
    const [donorCols] = await conn.query('DESCRIBE donors');
    donorCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check hospitals table structure
    console.log('\n📊 HOSPITALS table columns:');
    const [hospCols] = await conn.query('DESCRIBE hospitals');
    hospCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check blood_requests table structure
    console.log('\n📊 BLOOD_REQUESTS table columns:');
    const [reqCols] = await conn.query('DESCRIBE blood_requests');
    reqCols.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check donor_responses table structure
    console.log('\n📊 DONOR_RESPONSES table columns:');
    try {
      const [respCols] = await conn.query('DESCRIBE donor_responses');
      respCols.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (e) {
      console.log('  ⚠️  Table does not exist');
    }
    
    // Check notifications table structure
    console.log('\n📊 NOTIFICATIONS table columns:');
    try {
      const [notifCols] = await conn.query('DESCRIBE notifications');
      notifCols.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } catch (e) {
      console.log('  ⚠️  Table does not exist');
    }
    
    // Test a simple query
    console.log('\n🧪 Testing simple query:');
    try {
      const [result] = await conn.query('SELECT 1 as test');
      console.log('  ✓ Query successful');
    } catch (e) {
      console.log('  ✗ Query failed:', e.message);
    }
    
    // Test INSERT into users
    console.log('\n🧪 Testing INSERT into users:');
    try {
      const testEmail = `test_${Date.now()}@test.com`;
      const [result] = await conn.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test User', testEmail, 'hashedpass', 'donor']
      );
      console.log('  ✓ INSERT successful, ID:', result.insertId);
      // Clean up
      await conn.query('DELETE FROM users WHERE email = ?', [testEmail]);
    } catch (e) {
      console.log('  ✗ INSERT failed:', e.message);
      console.log('  Code:', e.code);
    }
    
    conn.release();
    console.log('\n✅ Diagnostic complete\n');
    
  } catch (err) {
    console.error('\n❌ DIAGNOSTIC ERROR:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  errno:', err.errno);
    console.error('');
  } finally {
    await pool.end();
  }
}

diagnose();
