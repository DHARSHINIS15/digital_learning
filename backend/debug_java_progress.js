require('dotenv').config();
const { pool } = require('./config/db');

async function debugJava() {
    try {
        const [course] = await pool.query('SELECT * FROM courses WHERE title LIKE "%JAVA%"');
        console.log('--- JAVA COURSES ---');
        console.log(JSON.stringify(course, null, 2));
        
        if (course.length > 0) {
            const courseId = course[0].id;
            const [lessons] = await pool.query('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
            console.log('\nTotal lessons for JAVA:', lessons.length);

            const [enrollments] = await pool.query('SELECT student_id, u.name FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = ?', [courseId]);
            console.log('\nEnrollments for JAVA:');
            console.table(enrollments);

            for (const student of enrollments) {
                const [progress] = await pool.query('SELECT * FROM progress_tracking WHERE course_id = ? AND student_id = ?', [courseId, student.student_id]);
                console.log(`\nProgress for ${student.name} (ID: ${student.student_id}):`);
                console.log('Progress rows count:', progress.length);
                if (progress.length > 0) {
                    console.table(progress);
                }
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
debugJava();
