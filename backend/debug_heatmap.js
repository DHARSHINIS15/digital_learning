require('dotenv').config();
const { pool } = require('./config/db');

async function debugHeatmapData() {
    try {
        console.log("Current Date (System):", new Date().toLocaleString());
        
        const [users] = await pool.query('SELECT id, email, role FROM users WHERE role = "student"');
        console.log("\n--- STUDENTS ---");
        console.log(JSON.stringify(users, null, 2));
        
        const [progress] = await pool.query(`
            SELECT p.student_id, u.email, p.last_accessed, p.course_id, p.lesson_id, p.completed 
            FROM progress_tracking p
            JOIN users u ON p.student_id = u.id
            ORDER BY p.last_accessed DESC LIMIT 10
        `);
        console.log("\n--- RECENT PROGRESS ---");
        console.log(JSON.stringify(progress, null, 2));
        
        const [quizzes] = await pool.query(`
            SELECT q.student_id, u.email, q.submitted_at, q.score_pct
            FROM quiz_attempts q
            JOIN users u ON q.student_id = u.id
            ORDER BY q.submitted_at DESC LIMIT 10
        `);
        console.log("\n--- RECENT QUIZZES ---");
        console.log(JSON.stringify(quizzes, null, 2));

        // Check specifically for TODAY's activity in the way the API does it
        const [activity] = await pool.query(`
            SELECT DATE(last_accessed) as d, COUNT(*) as c
            FROM progress_tracking
            WHERE last_accessed >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            GROUP BY DATE(last_accessed)
        `);
        console.log("\n--- TODAY'S ACTIVITY (Grouped by DATE()) ---");
        console.log(JSON.stringify(activity, null, 2));

    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

debugHeatmapData();
