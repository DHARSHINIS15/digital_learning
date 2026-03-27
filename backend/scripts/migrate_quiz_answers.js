const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                attempt_id INT NOT NULL,
                question_id INT NOT NULL,
                chosen_option CHAR(1),
                is_correct BOOLEAN DEFAULT 0,
                FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
            )
        `);
        console.log('SUCCESS: quiz_attempt_answers table created');
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    } finally {
        await conn.end();
    }
})();
