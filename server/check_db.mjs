import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
});

try {
  const [dbs] = await conn.query('SHOW DATABASES LIKE "bloodconnect"');
  console.log('bloodconnect database exists:', dbs.length > 0 ? 'YES ✓' : 'NO ✗');

  if (dbs.length === 0) {
    console.log('\n⚠️  Database "bloodconnect" does not exist!');
    console.log('Run the database.sql file to create it.');
  } else {
    await conn.query('USE bloodconnect');
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log('\nTables found:', tableNames.length > 0 ? tableNames.join(', ') : 'NONE ✗');

    const required = ['users', 'donors', 'hospitals', 'blood_requests', 'donor_responses', 'notifications'];
    const missing = required.filter(t => !tableNames.includes(t));
    if (missing.length > 0) {
      console.log('\n⚠️  Missing tables:', missing.join(', '));
      console.log('Run the database.sql file to create them.');
    } else {
      console.log('\n✓ All required tables exist!');
    }
  }
} finally {
  await conn.end();
}
