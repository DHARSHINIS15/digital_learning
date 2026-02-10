const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * POST /api/progress/update - Update lesson progress (completed, time_spent)
 */
const updateProgress = async (req, res) => {
  try {
    const { course_id, lesson_id, completed, time_spent_minutes } = req.body;
    const student_id = req.user.id;
    if (req.user.role !== 'student') {
      return error(res, 'Only students have progress tracking.', 403);
    }
    if (!course_id || !lesson_id) return error(res, 'course_id and lesson_id are required.', 400);
    // Verify enrollment
    const [enr] = await pool.execute('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [student_id, course_id]);
    if (enr.length === 0) return error(res, 'Not enrolled in this course.', 403);
    const mins = Math.max(0, parseInt(time_spent_minutes) || 0);
    const comp = completed === true || completed === 'true';
    await pool.execute(
      `INSERT INTO progress_tracking (student_id, course_id, lesson_id, completed, time_spent_minutes, last_accessed)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE completed = COALESCE(?, completed), time_spent_minutes = time_spent_minutes + ?,
       last_accessed = NOW()`,
      [student_id, course_id, lesson_id, comp, mins, comp, mins]
    );
    const [rows] = await pool.execute(
      'SELECT * FROM progress_tracking WHERE student_id = ? AND lesson_id = ?',
      [student_id, lesson_id]
    );
    return success(res, 'Progress updated', { progress: rows[0] });
  } catch (err) {
    console.error('Update progress error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/progress/student/:id - Admin/Instructor view student progress
 */
const getProgressByStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [rows] = await pool.execute(
      `SELECT pt.*, l.title as lesson_title, l.content_type, c.title as course_title
       FROM progress_tracking pt
       JOIN lessons l ON pt.lesson_id = l.id
       JOIN courses c ON pt.course_id = c.id
       WHERE pt.student_id = ?
       ORDER BY pt.course_id, l.sort_order`,
      [studentId]
    );
    return success(res, 'OK', { progress: rows });
  } catch (err) {
    console.error('Get progress error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/progress/my - Current student's progress
 */
const myProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT pt.*, l.title as lesson_title, l.content_type, l.sort_order, c.title as course_title
       FROM progress_tracking pt
       JOIN lessons l ON pt.lesson_id = l.id
       JOIN courses c ON pt.course_id = c.id
       WHERE pt.student_id = ?
       ORDER BY pt.course_id, l.sort_order`,
      [studentId]
    );
    return success(res, 'OK', { progress: rows });
  } catch (err) {
    console.error('My progress error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { updateProgress, getProgressByStudent, myProgress };
