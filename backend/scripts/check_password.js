const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function checkCommonPasswords() {
  const email = 'dharshini.cb23@bitsathy.ac.in';
  const commonPasswords = ['Admin@123', 'password123', 'dleo@123', 'bitsathy@123', 'dharshini@123'];
  
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digital_learning_optimizer',
    });
    
    const [rows] = await conn.execute('SELECT password_hash FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.log('User not found.');
      return;
    }
    
    const hash = rows[0].password_hash;
    console.log(`Checking hashes for ${email}...`);
    
    for (const pwd of commonPasswords) {
      const match = await bcrypt.compare(pwd, hash);
      if (match) {
        console.log(`FOUND! The password is: ${pwd}`);
        return;
      }
    }
    console.log('None of the common passwords matched.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

checkCommonPasswords();
