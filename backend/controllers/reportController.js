const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * GET /api/reports/student/:id - Progress report for a student (Admin/Instructor)
 */
const studentReport = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [student] = await pool.execute('SELECT id, name, email FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
    if (student.length === 0) return error(res, 'Student not found.', 404);
    const [enrollments] = await pool.execute(
      'SELECT course_id FROM enrollments WHERE student_id = ?',
      [studentId]
    );
    const report = [];
    for (const e of enrollments) {
      const [course] = await pool.execute('SELECT id, title FROM courses WHERE id = ?', [e.course_id]);
      if (course.length === 0) continue;
      const [lessons] = await pool.execute('SELECT id, title FROM lessons WHERE course_id = ? ORDER BY sort_order', [e.course_id]);
      const [prog] = await pool.execute(
        'SELECT lesson_id, completed, time_spent_minutes FROM progress_tracking WHERE student_id = ? AND course_id = ?',
        [studentId, e.course_id]
      );
      const completed = prog.filter(p => p.completed).length;
      const timeSpent = prog.reduce((s, p) => s + (p.time_spent_minutes || 0), 0);
      report.push({
        courseId: course[0].id,
        courseTitle: course[0].title,
        totalLessons: lessons.length,
        completedLessons: completed,
        completionPercentage: lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100),
        timeSpentMinutes: timeSpent,
      });
    }
    return success(res, 'OK', {
      student: student[0],
      courses: report,
    });
  } catch (err) {
    console.error('Student report error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/reports/course/:id - Course-wise performance (all enrolled students)
 */
const courseReport = async (req, res) => {
  try {
    const courseId = req.params.id;
    const [course] = await pool.execute('SELECT id, title, instructor_id FROM courses WHERE id = ?', [courseId]);
    if (course.length === 0) return error(res, 'Course not found.', 404);
    if (req.user.role === 'instructor' && course[0].instructor_id !== req.user.id) {
      return error(res, 'You can only view reports for your own courses.', 403);
    }
    const [lessons] = await pool.execute('SELECT id FROM lessons WHERE course_id = ?', [courseId]);
    const totalLessons = lessons.length;
    const [enrolled] = await pool.execute(
      'SELECT e.student_id, u.name FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = ?',
      [courseId]
    );
    const students = [];
    for (const row of enrolled) {
      const [prog] = await pool.execute(
        'SELECT completed, time_spent_minutes FROM progress_tracking WHERE student_id = ? AND course_id = ?',
        [row.student_id, courseId]
      );
      const completed = prog.filter(p => p.completed).length;
      const timeSpent = prog.reduce((s, p) => s + (p.time_spent_minutes || 0), 0);
      students.push({
        studentId: row.student_id,
        studentName: row.name,
        completedLessons: completed,
        totalLessons,
        completionPercentage: totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100),
        timeSpentMinutes: timeSpent,
      });
    }
    return success(res, 'OK', {
      course: course[0],
      totalLessons,
      students,
    });
  } catch (err) {
    console.error('Course report error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/reports/download/:id - Optional: return report data for CSV/PDF (id = student id or course id; type in query)
 * For simplicity we return JSON that frontend can convert to CSV.
 */
const downloadReport = async (req, res) => {
  try {
    const id = req.params.id;
    const type = req.query.type || 'student'; // 'student' | 'course'
    if (type === 'student') {
      const [student] = await pool.execute('SELECT id, name, email FROM users WHERE id = ?', [id]);
      if (student.length === 0) return error(res, 'Student not found.', 404);
      const [enrollments] = await pool.execute('SELECT course_id FROM enrollments WHERE student_id = ?', [id]);
      const courses = [];
      for (const e of enrollments) {
        const [course] = await pool.execute('SELECT id, title FROM courses WHERE id = ?', [e.course_id]);
        const [lessons] = await pool.execute('SELECT id FROM lessons WHERE course_id = ?', [e.course_id]);
        const [prog] = await pool.execute(
          'SELECT completed, time_spent_minutes FROM progress_tracking WHERE student_id = ? AND course_id = ?',
          [id, e.course_id]
        );
        const completed = prog.filter(p => p.completed).length;
        const timeSpent = prog.reduce((s, p) => s + (p.time_spent_minutes || 0), 0);
        courses.push({
          courseTitle: course[0].title,
          completedLessons: completed,
          totalLessons: lessons.length,
          completionPercentage: lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100),
          timeSpentMinutes: timeSpent,
        });
      }
      const data = { student: student[0], courses, generatedAt: new Date().toISOString() };
      return success(res, 'OK', { report: data, format: 'json' });
    } else {
      const [course] = await pool.execute('SELECT id, title FROM courses WHERE id = ?', [id]);
      if (course.length === 0) return error(res, 'Course not found.', 404);
      const [enrolled] = await pool.execute(
        'SELECT e.student_id, u.name FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = ?',
        [id]
      );
      const [lessons] = await pool.execute('SELECT id FROM lessons WHERE course_id = ?', [id]);
      const totalLessons = lessons.length;
      const students = enrolled.map(row => {
        // would need to aggregate progress per student - simplified
        return { studentId: row.student_id, studentName: row.name };
      });
      const data = { course: course[0], totalLessons, students, generatedAt: new Date().toISOString() };
      return success(res, 'OK', { report: data, format: 'json' });
    }
  } catch (err) {
    console.error('Download report error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { studentReport, courseReport, downloadReport };
