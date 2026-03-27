const mysql = require('mysql2/promise');
require('dotenv').config();

async function verify() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('--- Database Verification ---');
        const [tables] = await conn.execute('SHOW TABLES LIKE "quiz_attempt_answers"');
        console.log('Table quiz_attempt_answers exists:', tables.length > 0);

        const [cols] = await conn.execute('SHOW COLUMNS FROM quiz_attempt_answers');
        console.log('Columns:', cols.map(c => c.Field));

        // 1. Find a test quiz and student
        const [quizzes] = await conn.execute('SELECT id FROM quizzes LIMIT 1');
        const [students] = await conn.execute('SELECT id FROM users WHERE role = "student" LIMIT 1');
        
        if (quizzes.length > 0 && students.length > 0) {
            const quizId = quizzes[0].id;
            const studentId = students[0].id;

            console.log(`\n--- Simulating Quiz Submission for Quiz ${quizId}, Student ${studentId} ---`);
            
            // Get questions for this quiz
            const [questions] = await conn.execute('SELECT id, topic, correct_option FROM quiz_questions WHERE quiz_id = ?', [quizId]);
            if (questions.length === 0) {
                console.log('Skipping simulation: No questions in quiz.');
            } else {
                // Simulate attempt
                const [attemptRes] = await conn.execute(
                    'INSERT INTO quiz_attempts (student_id, quiz_id, score_pct) VALUES (?, ?, ?)',
                    [studentId, quizId, 50]
                );
                const attemptId = attemptRes.insertId;
                
                // Simulate answers: get first one right, second one wrong (if exists)
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const isCorrect = i === 0 ? 1 : 0; // First is correct, others wrong
                    const chosen = isCorrect ? q.correct_option : 'z'; // 'z' is wrong
                    
                    await conn.execute(
                        'INSERT INTO quiz_attempt_answers (attempt_id, question_id, chosen_option, is_correct) VALUES (?, ?, ?, ?)',
                        [attemptId, q.id, chosen, isCorrect]
                    );
                }
                console.log(`Attempt ${attemptId} simulated with ${questions.length} answers.`);

                // Verify getMyAttempts logic
                const [rows] = await conn.execute(
                    `SELECT qa.id, qa.score_pct,
                            (
                                SELECT GROUP_CONCAT(DISTINCT qq.topic SEPARATOR ', ')
                                FROM quiz_attempt_answers qaa
                                JOIN quiz_questions qq ON qaa.question_id = qq.id
                                WHERE qaa.attempt_id = qa.id AND qaa.is_correct = 0 AND qq.topic IS NOT NULL
                            ) as focus_topics
                    FROM quiz_attempts qa
                    WHERE qa.id = ?`,
                    [attemptId]
                );
                console.log('\n--- Retreived Attempt Data ---');
                console.log(rows[0]);

                if (rows[0].focus_topics || questions.length === 1) {
                    console.log('PASSED: focus_topics populated successfully.');
                } else {
                    console.log('FAILED: focus_topics is empty but should have topics.');
                }
                
                // Cleanup simulation
                await conn.execute('DELETE FROM quiz_attempts WHERE id = ?', [attemptId]);
                console.log('\nSimulation data cleaned up.');
            }
        } else {
            console.log('Skipping simulation: No quiz or student found.');
        }

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await conn.end();
    }
}
verify();
