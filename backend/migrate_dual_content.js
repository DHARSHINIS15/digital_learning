require('dotenv').config();
const { pool } = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration for dual content support...');

        // 1. Add text_content column and rename content_url to video_url
        // We check if the column text_content exists first to avoid errors on re-run
        const [columns] = await pool.execute('SHOW COLUMNS FROM lesson_contents');
        const hasTextContent = columns.some(c => c.Field === 'text_content');
        const hasVideoUrl = columns.some(c => c.Field === 'video_url');
        const hasContentUrl = columns.some(c => c.Field === 'content_url');

        if (!hasTextContent) {
            await pool.execute('ALTER TABLE lesson_contents ADD COLUMN text_content LONGTEXT');
            console.log('Added text_content column.');
        }

        if (hasContentUrl && !hasVideoUrl) {
            // Rename content_url to video_url
            // MySQL 8.0+ supports RENAME COLUMN, for older we use CHANGE
            try {
                await pool.execute('ALTER TABLE lesson_contents RENAME COLUMN content_url TO video_url');
            } catch (e) {
                await pool.execute('ALTER TABLE lesson_contents CHANGE COLUMN content_url video_url TEXT');
            }
            console.log('Renamed content_url to video_url.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
