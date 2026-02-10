const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * POST /api/enroll/:courseId - Student enrolls in course
 */
const enroll = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;
    if (req.user.role !== 'student') {
      return error(res, 'Only students can enroll in courses.', 403);
    }
    const [course] = await pool.execute('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (course.length === 0) return error(res, 'Course not found.', 404);
    try {
      await pool.execute('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [studentId, courseId]);
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') return error(res, 'Already enrolled in this course.', 400);
      throw e;
    }
    return success(res, 'Enrolled successfully', { courseId: parseInt(courseId) }, 201);
  } catch (err) {
    console.error('Enroll error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/enrollments/my - Current user's enrollments (students see their own)
 */
const myEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let query, params;
    if (role === 'student') {
      query = `SELECT e.id, e.course_id, e.enrolled_at, c.title, c.description, c.instructor_id, u.name as instructor_name
               FROM enrollments e JOIN courses c ON e.course_id = c.id LEFT JOIN users u ON c.instructor_id = u.id
               WHERE e.student_id = ? ORDER BY e.enrolled_at DESC`;
      params = [userId];
    } else {
      // Instructor/Admin: return all enrollments or filter as needed; for "my" we return enrollments in courses I teach (instructor) or all (admin)
      query = `SELECT e.id, e.student_id, e.course_id, e.enrolled_at, c.title, u.name as student_name
               FROM enrollments e JOIN courses c ON e.course_id = c.id JOIN users u ON e.student_id = u.id
               WHERE c.instructor_id = ? ORDER BY e.enrolled_at DESC`;
      params = [userId];
    }
    const [rows] = await pool.execute(query, params);
    return success(res, 'OK', { enrollments: rows });
  } catch (err) {
    console.error('My enrollments error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { enroll, myEnrollments };
