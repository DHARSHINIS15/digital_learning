
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'digital_learning_optimizer',
        });

        console.log('--- Lessons Table ---');
        const [lessons] = await conn.execute('DESCRIBE lessons');
        console.table(lessons);

        console.log('\n--- Lesson Contents Table ---');
        const [contents] = await conn.execute('DESCRIBE lesson_contents');
        console.table(contents);

        await conn.end();
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
