require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration for multi-content lessons...');

        // 1. Create lesson_contents table if it doesn't exist
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS lesson_contents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        lesson_id INT NOT NULL,
        title VARCHAR(255),
        content_type ENUM('video', 'pdf', 'link', 'text') NOT NULL,
        content_url TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        INDEX idx_lesson (lesson_id)
      )
    `);
        console.log('Table lesson_contents created/verified.');

        // 2. Migration: Move existing content from lessons to lesson_contents
        const [lessons] = await pool.execute('SELECT id, content_type, content_url, title FROM lessons');

        for (const lesson of lessons) {
            if (lesson.content_url) {
                // Check if already migrated
                const [existing] = await pool.execute('SELECT id FROM lesson_contents WHERE lesson_id = ? AND content_url = ?', [lesson.id, lesson.content_url]);

                if (existing.length === 0) {
                    await pool.execute(
                        'INSERT INTO lesson_contents (lesson_id, title, content_type, content_url, sort_order) VALUES (?, ?, ?, ?, ?)',
                        [lesson.id, 'Main Content', lesson.content_type, lesson.content_url, 0]
                    );
                    console.log(`Migrated lesson ID ${lesson.id}`);
                }
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
