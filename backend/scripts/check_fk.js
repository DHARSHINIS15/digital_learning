const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const [rows] = await conn.execute(`
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'quizzes' AND TABLE_SCHEMA = 'digital_learning_optimizer'
    `);
    console.log('Referencing tables:');
    console.log(rows);

    for (const row of rows) {
        const [createTable] = await conn.execute(`SHOW CREATE TABLE ${row.TABLE_NAME}`);
        console.log(`\nTable: ${row.TABLE_NAME}`);
        console.log(createTable[0]['Create Table']);
    }

    await conn.end();
}
check();
