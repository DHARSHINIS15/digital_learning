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
        console.log('Fixing quizzes table...');
        // Add columns if they don't exist
        const [cols] = await conn.execute('SHOW COLUMNS FROM quizzes');
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('description')) {
            await conn.execute('ALTER TABLE quizzes ADD COLUMN description TEXT AFTER title');
            console.log('Added description to quizzes');
        }
        if (!colNames.includes('passing_score_pct')) {
            await conn.execute('ALTER TABLE quizzes ADD COLUMN passing_score_pct INT DEFAULT 60 AFTER description');
            console.log('Added passing_score_pct to quizzes');
        }
        if (!colNames.includes('image_url')) {
            await conn.execute('ALTER TABLE quizzes ADD COLUMN image_url VARCHAR(255) DEFAULT NULL AFTER passing_score_pct');
            console.log('Added image_url to quizzes');
        }
    } catch (err) {
        console.error('Quizzes table fix failed:', err.message);
    }

    try {
        console.log('Creating quiz_questions table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option_a VARCHAR(255),
        option_b VARCHAR(255),
        option_c VARCHAR(255),
        option_d VARCHAR(255),
        correct_option ENUM('a', 'b', 'c', 'd') NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);
        console.log('quiz_questions table ready');
    } catch (err) {
        console.error('quiz_questions creation failed:', err.message);
    }

    try {
        console.log('Creating quiz_attempts table...');
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        quiz_id INT NOT NULL,
        score_pct INT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);
        console.log('quiz_attempts table ready');
    } catch (err) {
        console.error('quiz_attempts creation failed:', err.message);
    }

    console.log('Migration complete');
    await conn.end();
}
migrate();
