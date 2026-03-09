const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function findUser() {
  const email = 'dharshini.cb23@bitsathy.ac.in';
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digital_learning_optimizer',
    });
    const [rows] = await conn.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log('User found:', JSON.stringify(rows[0], null, 2));
    } else {
      console.log('User not found.');
      const [allUsers] = await conn.execute('SELECT email FROM users LIMIT 10');
      console.log('Recently added users:', allUsers.map(u => u.email).join(', '));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

findUser();
