import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

async function testAuth() {
  console.log('\n🧪 TESTING AUTH FLOW\n');
  
  try {
    const conn = await pool.getConnection();
    
    // Step 1: Test register
    console.log('📝 Step 1: Testing REGISTER');
    const testEmail = `test_${Date.now()}@test.com`;
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    try {
      const [result] = await conn.query(
        `INSERT INTO users (name, email, phone, password, role, is_verified)
         VALUES (?, ?, ?, ?, ?, 0)`,
        ['Test Donor', testEmail, '1234567890', hashedPassword, 'donor']
      );
      const userId = result.insertId;
      console.log(`  ✓ User created with ID: ${userId}`);
      
      // Create donor profile
      const [donorResult] = await conn.query(
        `INSERT INTO donors (user_id, blood_type, city, is_available)
         VALUES (?, ?, ?, 1)`,
        [userId, 'O+', 'New York']
      );
      console.log(`  ✓ Donor profile created`);
      
      // Step 2: Test login
      console.log('\n🔐 Step 2: Testing LOGIN');
      const [rows] = await conn.query(
        `SELECT id, name, email, phone, password, role, is_verified, created_at
         FROM users WHERE LOWER(email) = ? LIMIT 1`,
        [testEmail.toLowerCase()]
      );
      
      if (rows.length === 0) {
        console.log('  ✗ User not found');
      } else {
        const user = rows[0];
        console.log(`  ✓ User found: ${user.name} (${user.email})`);
        
        // Verify password
        const match = await bcrypt.compare(testPassword, user.password);
        if (match) {
          console.log('  ✓ Password matches');
        } else {
          console.log('  ✗ Password does not match');
        }
        
        // Test JWT signing
        console.log('\n🔑 Step 3: Testing JWT SIGNING');
        if (!process.env.JWT_SECRET) {
          console.log('  ✗ JWT_SECRET is not set!');
        } else {
          const token = jwt.sign(
            {
              id: user.id,
              userId: user.id,
              email: user.email,
              role: user.role,
              name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );
          console.log(`  ✓ Token created: ${token.substring(0, 50)}...`);
          
          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log(`  ✓ Token verified: ${decoded.email}`);
        }
      }
      
      // Cleanup
      console.log('\n🧹 Cleaning up test data');
      await conn.query('DELETE FROM donors WHERE user_id = ?', [userId]);
      await conn.query('DELETE FROM users WHERE id = ?', [userId]);
      console.log('  ✓ Test data deleted');
      
    } catch (e) {
      console.error('  ✗ Error:', e.message);
      console.error('  Code:', e.code);
      console.error('  SQL:', e.sql);
    }
    
    conn.release();
    console.log('\n✅ Auth test complete\n');
    
  } catch (err) {
    console.error('\n❌ TEST ERROR:');
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
  } finally {
    await pool.end();
  }
}

testAuth();
