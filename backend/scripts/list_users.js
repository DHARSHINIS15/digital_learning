const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function listUsers() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digital_learning_optimizer',
    });
    const [rows] = await conn.execute('SELECT email, password_hash, role FROM users');
    console.log('Users in database:');
    rows.forEach(user => {
      console.log(`${user.email} (${user.role}): ${user.password_hash}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

listUsers();
