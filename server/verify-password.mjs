import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 TIDB CLOUD PASSWORD VERIFICATION\n');

// List of possible passwords to try
const passwordsToTry = [
  process.env.DB_PASSWORD,  // Current password in .env
  'n8FlLrdof7QNiVMS',       // From documentation
  'YOUR_NEW_PASSWORD_HERE', // Placeholder
];

// Remove duplicates and empty values
const uniquePasswords = [...new Set(passwordsToTry)].filter(p => p && p !== 'YOUR_NEW_PASSWORD_HERE');

console.log(`Testing ${uniquePasswords.length} password(s)...\n`);

async function testPassword(password, index) {
  try {
    console.log(`📝 Attempt ${index + 1}: Testing password...`);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: password,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      ssl: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      }
    });
    
    await connection.ping();
    console.log(`✅ SUCCESS! Password works: ${password}\n`);
    console.log('💾 Update your .env file with:');
    console.log(`   DB_PASSWORD=${password}\n`);
    
    await connection.end();
    return true;
    
  } catch (err) {
    console.log(`❌ Failed: ${err.message}\n`);
    return false;
  }
}

async function runTests() {
  let found = false;
  
  for (let i = 0; i < uniquePasswords.length; i++) {
    const success = await testPassword(uniquePasswords[i], i);
    if (success) {
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log('❌ None of the passwords worked.\n');
    console.log('💡 NEXT STEPS:');
    console.log('  1. Go to https://tidbcloud.com');
    console.log('  2. Login to your account');
    console.log('  3. Click your cluster');
    console.log('  4. Click "Connect"');
    console.log('  5. Copy the connection string');
    console.log('  6. Extract the password from the connection string');
    console.log('  7. Update DB_PASSWORD in server/.env');
    console.log('  8. Run this script again\n');
  }
}

runTests();
