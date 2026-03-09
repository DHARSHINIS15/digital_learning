require('dotenv').config();
const { pool } = require('./config/db');

async function debugJavaShort() {
    try {
        const [course] = await pool.query('SELECT id, title FROM courses WHERE title LIKE "%JAVA%"');
        if (course.length === 0) {
            console.log("Course JAVA not found");
            return;
        }
        const courseId = course[0].id;
        const [lessons] = await pool.query('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
        const totalLessons = lessons.length;
        console.log(`Course: ${course[0].title} (ID: ${courseId})`);
        console.log(`Total Lessons: ${totalLessons}`);

        const [enrollments] = await pool.query('SELECT student_id, u.name FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = ?', [courseId]);
        
        for (const student of enrollments) {
            const [progress] = await pool.query('SELECT completed FROM progress_tracking WHERE course_id = ? AND student_id = ?', [courseId, student.student_id]);
            const completedCount = progress.filter(p => p.completed).length;
            const pct = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);
            console.log(`Student: ${student.name} (ID: ${student.student_id}) - Progress Rows: ${progress.length}, Completed: ${completedCount}, Calc Pct: ${pct}%`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debugJavaShort();
