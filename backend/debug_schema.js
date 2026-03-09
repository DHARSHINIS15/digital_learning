const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'digital_learning_optimizer',
        });

        const fs = require('fs');
        let output = '--- LESSONS COLUMNS ---\n';
        const [lRows] = await conn.execute('DESCRIBE lessons');
        lRows.forEach(r => {
            output += `${r.Field}: Null=${r.Null}, Default=${r.Default}, Type=${r.Type}\n`;
        });

        output += '\n--- LESSON_CONTENTS COLUMNS ---\n';
        const [cRows] = await conn.execute('DESCRIBE lesson_contents');
        cRows.forEach(r => {
            output += `${r.Field}: Null=${r.Null}, Default=${r.Default}, Type=${r.Type}\n`;
        });

        fs.writeFileSync('schema_output.txt', output);
        console.log('Schema written to schema_output.txt');

        await conn.end();
    } catch (err) {
        console.error(err);
    }
}
check();
