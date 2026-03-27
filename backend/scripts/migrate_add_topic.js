const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  try {
    await conn.execute(
      'ALTER TABLE quiz_questions ADD COLUMN topic VARCHAR(255) DEFAULT NULL AFTER quiz_id'
    );
    console.log('SUCCESS: topic column added to quiz_questions');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('ALREADY EXISTS: topic column already present, skipping.');
    } else {
      console.error('ERROR:', e.message);
      process.exit(1);
    }
  } finally {
    await conn.end();
  }
})();
