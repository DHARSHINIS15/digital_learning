const mysql = require('mysql2/promise');
require('dotenv').config();

async function verify() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // 1. Verify "Think in Java" is gone (ID 1 was deleted)
        const [rows1] = await conn.execute('SELECT * FROM quizzes WHERE title = "Think in Java"');
        if (rows1.length === 0) {
            console.log('Verification PASSED: "Think in Java" quiz not found.');
        } else {
            console.error('Verification FAILED: "Think in Java" quiz still exists!', rows1);
        }

        // 2. Verify "Java Question Bank" (ID 3) image
        const [rows3] = await conn.execute('SELECT id, title, image_url FROM quizzes WHERE title = "Java Question Bank"');
        if (rows3.length > 0 && rows3[0].image_url === 'http://localhost:5001/uploads/java_quiz_banner.png') {
            console.log('Verification PASSED: "Java Question Bank" has the correct image URL.');
        } else {
            console.error('Verification FAILED: "Java Question Bank" image URL is incorrect or not found.', rows3);
        }

    } catch (err) {
        console.error('Verification script failed:', err);
    } finally {
        await conn.end();
    }
}
verify();
