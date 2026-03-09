
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

        console.log('--- Lessons Table Columns ---');
        const [lessons] = await conn.execute('SHOW COLUMNS FROM lessons');
        lessons.forEach(c => console.log(`${c.Field}: ${c.Type} (Null: ${c.Null})`));

        console.log('\n--- Lesson Contents Table Columns ---');
        const [contents] = await conn.execute('SHOW COLUMNS FROM lesson_contents');
        contents.forEach(c => console.log(`${c.Field}: ${c.Type} (Null: ${c.Null})`));

        await conn.end();
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
