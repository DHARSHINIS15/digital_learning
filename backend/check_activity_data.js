require('dotenv').config();
const { pool } = require('./config/db');

async function checkData() {
    try {
        const [progress] = await pool.query('SELECT student_id, last_accessed FROM progress_tracking');
        console.log("--- PROGRESS TRACKING ROWS ---");
        console.table(progress);
        
        const [quizzes] = await pool.query('SELECT student_id, submitted_at FROM quiz_attempts');
        console.log("--- QUIZ ATTEMPTS ROWS ---");
        console.table(quizzes);

    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkData();
