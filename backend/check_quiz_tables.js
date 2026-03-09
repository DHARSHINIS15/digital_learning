const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'digital_learning_optimizer',
    });

    const [tables] = await conn.execute('SHOW TABLES');
    for (const t of tables) {
        const tableName = Object.values(t)[0];
        if (tableName.startsWith('quiz')) {
            console.log(`\nTable: ${tableName}`);
            const [cols] = await conn.execute(`SHOW COLUMNS FROM ${tableName}`);
            cols.forEach(c => console.log(` - ${c.Field}: ${c.Type}`));
        }
    }
    await conn.end();
}
check();
