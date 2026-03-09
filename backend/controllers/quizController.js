const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

const canEditCourse = async (courseId, userId, userRole) => {
  if (userRole === 'admin') return true;
  const [rows] = await pool.execute('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
  return rows.length > 0 && rows[0].instructor_id === userId;
};

/**
 * POST /api/quizzes - Create quiz for a course (instructor/admin)
 */
const createQuiz = async (req, res) => {
  try {
    const { course_id, title, passing_score_pct, image_url } = req.body;
    if (!course_id || !title) return error(res, 'course_id and title are required.', 400);
    const allowed = await canEditCourse(course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'You can only add quizzes to your own course.', 403);
    const [result] = await pool.execute(
      'INSERT INTO quizzes (course_id, title, passing_score_pct, image_url) VALUES (?, ?, ?, ?)',
      [course_id, title, passing_score_pct != null ? passing_score_pct : 60, image_url || null]
    );
    const [rows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [result.insertId]);
    return success(res, 'Quiz created', { quiz: rows[0] }, 201);
  } catch (err) {
    console.error('Create quiz error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/quizzes/course/:courseId - List quizzes for a course
 */
const getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const [rows] = await pool.execute(
      'SELECT * FROM quizzes WHERE course_id = ? ORDER BY created_at DESC',
      [courseId]
    );
    return success(res, 'OK', { quizzes: rows });
  } catch (err) {
    console.error('Get quizzes error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/quizzes/:id - Get quiz with questions (for taking quiz; hide correct_option from client or send after submit)
 */
const getQuizWithQuestions = async (req, res) => {
  try {
    const quizId = req.params.id;
    const [quizRows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);
    const [questions] = await pool.execute(
      'SELECT id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, image_url FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id',
      [quizId]
    );
    return success(res, 'OK', {
      quiz: quizRows[0],
      questions: questions.map((q) => ({ ...q, correct_option: undefined })),
    });
  } catch (err) {
    console.error('Get quiz error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * POST /api/quizzes/:id/submit - Submit quiz attempt (student). Body: { answers: { questionId: 'a'|'b'|'c'|'d' } }
 */
const submitAttempt = async (req, res) => {
  try {
    if (req.user.role !== 'student') return error(res, 'Only students can submit quiz attempts.', 403);
    const quizId = req.params.id;
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') return error(res, 'answers object is required.', 400);

    const [quizRows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);
    const quiz = quizRows[0];
    const [questions] = await pool.execute('SELECT id, correct_option FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    if (questions.length === 0) return error(res, 'Quiz has no questions.', 400);

    const [enr] = await pool.execute('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [req.user.id, quiz.course_id]);
    if (enr.length === 0) return error(res, 'You must be enrolled in this course to take the quiz.', 403);

    let correct = 0;
    for (const q of questions) {
      const chosen = (answers[q.id] || '').toLowerCase().trim();
      if (chosen === (q.correct_option || '').toLowerCase()) correct++;
    }
    const score_pct = Math.round((correct / questions.length) * 100);

    await pool.execute(
      'INSERT INTO quiz_attempts (student_id, quiz_id, score_pct) VALUES (?, ?, ?)',
      [req.user.id, quizId, score_pct]
    );

    return success(res, 'Quiz submitted', {
      score_pct,
      correct,
      total: questions.length,
      passed: score_pct >= (quiz.passing_score_pct || 60),
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/quizzes/my-attempts - Current student's quiz attempts (for marks)
 */
const getMyAttempts = async (req, res) => {
  try {
    if (req.user.role !== 'student') return error(res, 'Only students can view own attempts.', 403);
    const [rows] = await pool.execute(
      `SELECT qa.*, q.title as quiz_title, q.course_id, q.passing_score_pct, c.title as course_title
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN courses c ON q.course_id = c.id
       WHERE qa.student_id = ?
       ORDER BY qa.submitted_at DESC`,
      [req.user.id]
    );
    return success(res, 'OK', { attempts: rows });
  } catch (err) {
    console.error('Get my attempts error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/quizzes/recommendations - Recommend course/topic based on low quiz marks
 */
const getRecommendations = async (req, res) => {
  try {
    if (req.user.role !== 'student') return error(res, 'Only students get recommendations.', 403);
    const [rows] = await pool.execute(
      `SELECT q.course_id, c.title as course_title, q.id as quiz_id, q.title as quiz_title,
              MAX(qa.score_pct) as best_score, q.passing_score_pct
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN courses c ON q.course_id = c.id
       WHERE qa.student_id = ?
       GROUP BY q.id, q.course_id, c.title, q.title, q.passing_score_pct
       HAVING best_score < passing_score_pct OR best_score < 70`,
      [req.user.id]
    );
    return success(res, 'OK', { recommendations: rows });
  } catch (err) {
    console.error('Recommendations error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * POST /api/quizzes/:id/questions - Add question to quiz (instructor/admin)
 */
const addQuestion = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, image_url } = req.body;
    if (!question_text || !correct_option) return error(res, 'question_text and correct_option required.', 400);
    const [quizRows] = await pool.execute('SELECT course_id FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);
    const allowed = await canEditCourse(quizRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'Forbidden.', 403);
    const [maxOrder] = await pool.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as n FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    const [result] = await pool.execute(
      `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quizId, question_text, option_a || null, option_b || null, option_c || null, option_d || null, correct_option, maxOrder[0].n, image_url || null]
    );
    const [rows] = await pool.execute('SELECT * FROM quiz_questions WHERE id = ?', [result.insertId]);
    return success(res, 'Question added', { question: rows[0] }, 201);
  } catch (err) {
    console.error('Add question error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/quizzes/:id/questions - List questions (instructor/admin only; includes correct_option)
 */
const getQuizQuestions = async (req, res) => {
  try {
    const quizId = req.params.id;
    const [quizRows] = await pool.execute('SELECT course_id FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);
    const allowed = await canEditCourse(quizRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'Forbidden.', 403);
    const [rows] = await pool.execute('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order, id', [quizId]);
    return success(res, 'OK', { questions: rows });
  } catch (err) {
    console.error('Get questions error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * POST /api/quizzes/:id/questions/batch - Add multiple questions to quiz
 */
const addBatchQuestions = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const quizId = req.params.id;
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return error(res, 'An array of questions is required.', 400);
    }

    const [quizRows] = await conn.execute('SELECT course_id FROM quizzes WHERE id = ?', [quizId]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);
    const allowed = await canEditCourse(quizRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'Forbidden.', 403);

    await conn.beginTransaction();
    const [maxOrderRows] = await conn.execute('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM quiz_questions WHERE quiz_id = ?', [quizId]);
    let currentOrder = maxOrderRows[0].max_order;

    for (const q of questions) {
      if (!q.question_text || !q.correct_option) {
        await conn.rollback();
        return error(res, 'Each question must have text and a correct option.', 400);
      }
      currentOrder++;
      await conn.execute(
        `INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, sort_order, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [quizId, q.question_text, q.option_a || null, q.option_b || null, q.option_c || null, q.option_d || null, q.correct_option, currentOrder, q.image_url || null]
      );
    }

    await conn.commit();
    return success(res, `${questions.length} questions added successfully.`, null, 201);
  } catch (err) {
    await conn.rollback();
    console.error('Batch add questions error:', err);
    return error(res, 'Server error.', 500);
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/quizzes/questions/:id - Delete a question
 */
const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const [qRows] = await pool.execute('SELECT quiz_id FROM quiz_questions WHERE id = ?', [questionId]);
    if (qRows.length === 0) return error(res, 'Question not found.', 404);

    const [quizRows] = await pool.execute('SELECT course_id FROM quizzes WHERE id = ?', [qRows[0].quiz_id]);
    if (quizRows.length === 0) return error(res, 'Quiz not found.', 404);

    const allowed = await canEditCourse(quizRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'Forbidden.', 403);

    await pool.execute('DELETE FROM quiz_questions WHERE id = ?', [questionId]);
    return success(res, 'Question deleted successfully.');
  } catch (err) {
    console.error('Delete question error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuizWithQuestions,
  submitAttempt,
  getMyAttempts,
  getRecommendations,
  addQuestion,
  getQuizQuestions,
  addBatchQuestions,
  deleteQuestion,
};
