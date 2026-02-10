const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * Engagement score: (completion% * 0.6) + (timeSpentFactor * 0.4)
 * timeSpentFactor: min(1, totalTimeSpent / expectedTotalTime) - cap at 1
 */
function computeEngagement(completedLessons, totalLessons, timeSpentMinutes, expectedTotalMinutes) {
  const completionPct = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;
  const expected = expectedTotalMinutes || 1;
  const timeSpentFactor = Math.min(1, timeSpentMinutes / expected);
  const engagement = completionPct / 100 * 0.6 + timeSpentFactor * 0.4;
  return Math.round(engagement * 100) / 100;
}

/**
 * GET /api/analytics/admin - Admin dashboard stats
 */
const adminAnalytics = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'");
    const [[{ totalInstructors }]] = await pool.query("SELECT COUNT(*) as totalInstructors FROM users WHERE role = 'instructor'");
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) as totalCourses FROM courses');
    const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) as totalEnrollments FROM enrollments');
    const [courseStats] = await pool.query(
      `SELECT c.id, c.title, COUNT(DISTINCT e.student_id) as enrolled, COUNT(DISTINCT l.id) as lessons
       FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id LEFT JOIN lessons l ON c.id = l.course_id
       GROUP BY c.id, c.title`
    );
    return success(res, 'OK', {
      totalUsers: totalUsers || 0,
      totalStudents: totalStudents || 0,
      totalInstructors: totalInstructors || 0,
      totalCourses: totalCourses || 0,
      totalEnrollments: totalEnrollments || 0,
      courseStats,
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/analytics/instructor/:id - Instructor dashboard (own courses engagement)
 */
const instructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.params.id;
    if (req.user.role === 'instructor' && req.user.id !== parseInt(instructorId)) {
      return error(res, 'You can only view your own analytics.', 403);
    }
    const [courses] = await pool.execute(
      'SELECT id, title FROM courses WHERE instructor_id = ?',
      [instructorId]
    );
    const result = [];
    for (const c of courses) {
      const [[{ totalLessons }]] = await pool.query('SELECT COUNT(*) as totalLessons FROM lessons WHERE course_id = ?', [c.id]);
      const [enrolled] = await pool.query('SELECT student_id FROM enrollments WHERE course_id = ?', [c.id]);
      let completedCount = 0;
      let totalTime = 0;
      let expectedTime = 0;
      const [lessonDurations] = await pool.query('SELECT id, duration_minutes FROM lessons WHERE course_id = ?', [c.id]);
      expectedTime = lessonDurations.reduce((s, l) => s + (l.duration_minutes || 0), 0) || 1;
      for (const e of enrolled) {
        const [comp] = await pool.query(
          'SELECT COUNT(*) as n FROM progress_tracking WHERE student_id = ? AND course_id = ? AND completed = 1',
          [e.student_id, c.id]
        );
        const [time] = await pool.query(
          'SELECT COALESCE(SUM(time_spent_minutes), 0) as t FROM progress_tracking WHERE student_id = ? AND course_id = ?',
          [e.student_id, c.id]
        );
        completedCount += comp[0].n;
        totalTime += time[0].t || 0;
      }
      const totalPossible = enrolled.length * (totalLessons || 0);
      const completionRate = totalPossible === 0 ? 0 : Math.round((completedCount / totalPossible) * 100);
      result.push({
        courseId: c.id,
        courseTitle: c.title,
        totalLessons: totalLessons || 0,
        totalEnrolled: enrolled.length,
        completionRate,
        totalTimeSpent: totalTime,
      });
    }
    return success(res, 'OK', { courses: result });
  } catch (err) {
    console.error('Instructor analytics error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/analytics/student/:id - Student dashboard (progress, engagement)
 */
const studentAnalytics = async (req, res) => {
  try {
    const studentId = req.params.id;
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return error(res, 'You can only view your own analytics.', 403);
    }
    const [enrollments] = await pool.execute(
      'SELECT course_id FROM enrollments WHERE student_id = ?',
      [studentId]
    );
    const courseIds = enrollments.map(e => e.course_id);
    const byCourse = [];
    let totalCompleted = 0;
    let totalLessons = 0;
    let totalTimeSpent = 0;
    let totalExpected = 0;
    for (const cid of courseIds) {
      const [course] = await pool.execute('SELECT id, title FROM courses WHERE id = ?', [cid]);
      if (course.length === 0) continue;
      const [lessons] = await pool.execute('SELECT id, duration_minutes FROM lessons WHERE course_id = ?', [cid]);
      const expected = lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0) || 1;
      const [prog] = await pool.execute(
        'SELECT completed, time_spent_minutes FROM progress_tracking WHERE student_id = ? AND course_id = ?',
        [studentId, cid]
      );
      const completed = prog.filter(p => p.completed).length;
      const timeSpent = prog.reduce((s, p) => s + (p.time_spent_minutes || 0), 0);
      totalCompleted += completed;
      totalLessons += lessons.length;
      totalTimeSpent += timeSpent;
      totalExpected += expected;
      const completionPct = lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100);
      const engagement = computeEngagement(completed, lessons.length, timeSpent, expected);
      byCourse.push({
        courseId: cid,
        courseTitle: course[0].title,
        completedLessons: completed,
        totalLessons: lessons.length,
        completionPercentage: completionPct,
        timeSpentMinutes: timeSpent,
        expectedMinutes: expected,
        engagementScore: engagement,
      });
    }
    const overallEngagement = totalLessons === 0 ? 0 : computeEngagement(totalCompleted, totalLessons, totalTimeSpent, totalExpected || 1);
    return success(res, 'OK', {
      byCourse,
      overall: {
        totalCompleted,
        totalLessons,
        totalTimeSpent,
        completionPercentage: totalLessons === 0 ? 0 : Math.round((totalCompleted / totalLessons) * 100),
        engagementScore: overallEngagement,
      },
    });
  } catch (err) {
    console.error('Student analytics error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { adminAnalytics, instructorAnalytics, studentAnalytics };
