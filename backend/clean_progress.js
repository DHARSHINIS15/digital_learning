require('dotenv').config();
const { pool } = require('./config/db');

async function cleanAndCheck() {
    try {
        console.log("Cleaning progress_tracking table...");
        const [result] = await pool.query('DELETE FROM progress_tracking');
        console.log(`Deleted ${result.affectedRows} rows from progress_tracking.`);

        const [users] = await pool.query('SELECT id, name FROM users WHERE name IN ("DHARSHINI S", "SOBIKA")');
        console.log("\nUsers Found:");
        console.log(JSON.stringify(users, null, 2));

        const [course] = await pool.query('SELECT id, title FROM courses WHERE title = "JAVA"');
        if (course.length > 0) {
            const courseId = course[0].id;
            const [lessons] = await pool.query('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
            console.log(`\nJAVA Course ID: ${courseId}, Total Lessons: ${lessons.length}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
cleanAndCheck();
