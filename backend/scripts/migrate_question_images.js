require('dotenv').config();
const { pool } = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration to add image_url to quiz_questions...');

        const query = "ALTER TABLE quiz_questions ADD COLUMN image_url TEXT";

        try {
            await pool.execute(query);
            console.log(`Executed: ${query}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Skipped: image_url already exists in quiz_questions.');
            } else {
                console.error('Error executing migration:', err.message);
                throw err;
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
