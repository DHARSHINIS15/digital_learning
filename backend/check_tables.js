const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'digital_learning_optimizer',
    });
    const [rows] = await conn.execute('SELECT * FROM lesson_contents ORDER BY id DESC');
    console.log('Last 5 lesson contents:');
    rows.forEach(r => console.log(JSON.stringify(r, null, 2)));
    await conn.end();
}
check();
