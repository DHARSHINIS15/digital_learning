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
        console.log('Adding image_url to courses...');
        await conn.execute('ALTER TABLE courses ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description');
    } catch (err) {
        console.log('courses.image_url possibly exists:', err.message);
    }

    try {
        console.log('Adding image_url to lessons...');
        await conn.execute('ALTER TABLE lessons ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER video_url');
    } catch (err) {
        console.log('lessons.image_url possibly exists:', err.message);
    }

    try {
        console.log('Adding image_url to quizzes...');
        await conn.execute('ALTER TABLE quizzes ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER description');
    } catch (err) {
        console.log('quizzes.image_url possibly exists:', err.message);
    }

    console.log('Migration complete');
    await conn.end();
}
migrate();
