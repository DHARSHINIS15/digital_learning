const mysql = require('mysql2/promise');
require('dotenv').config();

async function execute() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        await conn.beginTransaction();

        // 1. Delete "Think in Java" (ID 1)
        const [delResult] = await conn.execute('DELETE FROM quizzes WHERE id = ?', [1]);
        console.log(`Deleted quiz ID 1: ${delResult.affectedRows} row(s) affected.`);

        // 2. Update "Java Question Bank" (ID 6) image
        const imageUrl = 'http://localhost:5001/uploads/java_quiz_banner.png';
        const [updResult] = await conn.execute('UPDATE quizzes SET image_url = ? WHERE id = ?', [imageUrl, 6]);
        console.log(`Updated quiz ID 6 image: ${updResult.affectedRows} row(s) affected.`);

        await conn.commit();
        console.log('Transaction committed successfully.');
    } catch (err) {
        await conn.rollback();
        console.error('Execution failed, rolled back:', err);
    } finally {
        await conn.end();
    }
}
execute();
