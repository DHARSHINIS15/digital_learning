const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // Check if column exists before adding to avoid errors on re-run
        // But simplistic approach: just try catch or use specific query if supported. 
        // MySQL 8+ supports IF NOT EXISTS in ALTER TABLE but older versions might not.
        // Safest is to try and ignore specific error or check schema.

        const queries = [
            "ALTER TABLE courses ADD COLUMN image_url TEXT",
            "ALTER TABLE lessons ADD COLUMN image_url TEXT",
            "ALTER TABLE quizzes ADD COLUMN image_url TEXT"
        ];

        for (const query of queries) {
            try {
                await pool.execute(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            }
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
