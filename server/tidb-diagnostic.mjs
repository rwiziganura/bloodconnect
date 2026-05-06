import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 TIDB CLOUD DIAGNOSTIC - COMPREHENSIVE\n');
console.log('Connection Details:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'MISSING'}`);
console.log('');

if (!process.env.DB_PASSWORD) {
  console.error('❌ ERROR: DB_PASSWORD is not set in .env file');
  console.error('   Please set: DB_PASSWORD=n8FlLrdof7QNiVMS');
  process.exit(1);
}

async function runDiagnostics() {
  let connection;
  
  try {
    // Test 1: Basic Connection
    console.log('📝 Test 1: Basic Connection');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Connected to TiDB Cloud\n');

    // Test 2: Simple Query
    console.log('📝 Test 2: Simple Query');
    const [result] = await connection.query('SELECT 1 as test');
    console.log('✅ Query successful:', result[0], '\n');

    // Test 3: Check Users Table
    console.log('📝 Test 3: Users Table Structure');
    const [columns] = await connection.query('DESCRIBE users');
    console.log('✅ Users table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    // Test 4: Count Users
    console.log('📝 Test 4: Count Users');
    const [[{ count }]] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users in database: ${count}\n`);

    // Test 5: Test INSERT
    console.log('📝 Test 5: Test INSERT');
    const testEmail = `test_${Date.now()}@test.com`;
    const [insertResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)',
      ['Test User', testEmail, 'hashedpass123', 'donor', 0]
    );
    console.log(`✅ INSERT successful, ID: ${insertResult.insertId}\n`);

    // Test 6: Test SELECT
    console.log('📝 Test 6: Test SELECT');
    const [selectResult] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [testEmail]
    );
    console.log('✅ SELECT successful:', selectResult[0], '\n');

    // Test 7: Test UPDATE
    console.log('📝 Test 7: Test UPDATE');
    const [updateResult] = await connection.query(
      'UPDATE users SET name = ? WHERE email = ?',
      ['Updated User', testEmail]
    );
    console.log(`✅ UPDATE successful, affected rows: ${updateResult.affectedRows}\n`);

    // Test 8: Test DELETE
    console.log('📝 Test 8: Test DELETE');
    const [deleteResult] = await connection.query(
      'DELETE FROM users WHERE email = ?',
      [testEmail]
    );
    console.log(`✅ DELETE successful, affected rows: ${deleteResult.affectedRows}\n`);

    // Test 9: Test Connection Pool
    console.log('📝 Test 9: Connection Pool');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      },
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });
    
    const poolConn = await pool.getConnection();
    const [poolResult] = await poolConn.query('SELECT 1 as test');
    console.log('✅ Pool connection successful:', poolResult[0]);
    poolConn.release();
    await pool.end();
    console.log('✅ Pool closed\n');

    // Test 10: Test bcrypt
    console.log('📝 Test 10: Bcrypt Hashing');
    const bcrypt = await import('bcryptjs');
    const password = 'testpassword123';
    const hash = await bcrypt.default.hash(password, 10);
    const match = await bcrypt.default.compare(password, hash);
    console.log(`✅ Bcrypt hash: ${hash.substring(0, 30)}...`);
    console.log(`✅ Bcrypt compare: ${match}\n`);

    // Test 11: Test JWT
    console.log('📝 Test 11: JWT Token');
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { id: 1, email: 'test@test.com', role: 'donor' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`✅ JWT token: ${token.substring(0, 50)}...`);
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    console.log(`✅ JWT decoded: ${JSON.stringify(decoded)}\n`);

    console.log('✅ ALL TESTS PASSED\n');
    console.log('🎉 TiDB Cloud is properly configured and working!\n');

  } catch (err) {
    console.error('\n❌ ERROR:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  errno:', err.errno);
    console.error('  sqlState:', err.sqlState);
    console.error('  Full Error:', err);
    console.error('');
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 HINT: Check your DB_PASSWORD in .env file');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 HINT: Database "bloodconnect" does not exist');
    } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('💡 HINT: Connection lost - check network/firewall');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runDiagnostics();
