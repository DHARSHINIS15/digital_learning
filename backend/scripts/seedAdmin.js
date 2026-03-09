/**
 * Seed default admin user.
 * Run: node scripts/seedAdmin.js
 * Default: dharshinis415@gmail.com / Admin@123
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const DEFAULT_ADMIN = {
  name: 'System Admin',
  email: 'dharshinis415@gmail.com',
  password: 'Admin@123',
  role: 'admin',
};

async function seed() {
  let conn;
  try {
    console.log("DB_USER:", process.env.DB_USER);
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
    console.log("DB_NAME:", process.env.DB_NAME);
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'digital_learning_optimizer',
    });
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [DEFAULT_ADMIN.email]);
    if (existing.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
      return;
    }
    const password_hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await conn.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [DEFAULT_ADMIN.name, DEFAULT_ADMIN.email, password_hash, DEFAULT_ADMIN.role]
    );
    console.log('Admin user created: dharshinis415@gmail.com / Admin@123');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();
