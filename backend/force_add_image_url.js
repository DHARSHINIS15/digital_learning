
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'digital_learning_optimizer',
    });

    try {
        console.log('Attempting to add image_url to lessons...');
        // Try to add it. If it fails, we catch it.
        await conn.execute('ALTER TABLE lessons ADD COLUMN image_url VARCHAR(255) DEFAULT NULL');
        console.log('SUCCESS: image_url column added to lessons table.');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('NOTICE: image_url column already exists.');
        } else {
            console.error('ERROR adding column:', err.message);
        }
    }

    // Let's verify it exists now
    try {
        const [cols] = await conn.execute('SHOW COLUMNS FROM lessons LIKE "image_url"');
        if (cols.length > 0) {
            console.log('VERIFIED: image_url column exists.');
        } else {
            console.error('FAILED: image_url column does NOT exist after attempt.');
        }
    } catch (e) {
        console.error('Error verifying column:', e);
    }

    await conn.end();
}
migrate();
