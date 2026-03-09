const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * Helper to get YYYY-MM-DD string from a Date object
 */
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/activity/me - Activity by day for last 365 days (for heatmap).
 * Count = progress updates (lesson completions/access) + quiz attempts per day.
 */
const getMyActivity = async (req, res) => {
  try {
    if (req.user.role !== 'student') return error(res, 'Only students have activity calendar.', 403);
    const studentId = req.user.id;

    const [progressDays] = await pool.execute(
      `SELECT DATE(last_accessed) as d, COUNT(*) as c
       FROM progress_tracking
       WHERE student_id = ? AND last_accessed >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(last_accessed)`,
      [studentId]
    );
    const [quizDays] = await pool.execute(
      `SELECT DATE(submitted_at) as d, COUNT(*) as c
       FROM quiz_attempts
       WHERE student_id = ? AND submitted_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(submitted_at)`,
      [studentId]
    );

    const byDate = {};
    for (const row of progressDays) {
      const d = formatDate(row.d);
      if (d) byDate[d] = (byDate[d] || 0) + Number(row.c);
    }
    for (const row of quizDays) {
      const d = formatDate(row.d);
      if (d) byDate[d] = (byDate[d] || 0) + Number(row.c);
    }

    const days = Object.entries(byDate).map(([date, count]) => ({ date, count }));
    const total = days.reduce((s, x) => s + x.count, 0);
    const maxInDay = days.length ? Math.max(...days.map((x) => x.count)) : 0;

    return success(res, 'OK', {
      days,
      totalActivity: total,
      maxPerDay: maxInDay,
    });
  } catch (err) {
    console.error('Activity error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/activity/student/:id - Activity for a specific student (Admin/Instructor view)
 */
const getActivityByStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    // Role check is handled by middleware, but extra caution:
    // If instructor, maybe ensure enrollment? For now, let's allow admin/instructor to view any student's activity.

    // We can reuse the same logic
    const [progressDays] = await pool.execute(
      `SELECT DATE(last_accessed) as d, COUNT(*) as c
       FROM progress_tracking
       WHERE student_id = ? AND last_accessed >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(last_accessed)`,
      [studentId]
    );
    const [quizDays] = await pool.execute(
      `SELECT DATE(submitted_at) as d, COUNT(*) as c
       FROM quiz_attempts
       WHERE student_id = ? AND submitted_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(submitted_at)`,
      [studentId]
    );

    const byDate = {};
    for (const row of progressDays) {
      const d = formatDate(row.d);
      if (d) byDate[d] = (byDate[d] || 0) + Number(row.c);
    }
    for (const row of quizDays) {
      const d = formatDate(row.d);
      if (d) byDate[d] = (byDate[d] || 0) + Number(row.c);
    }

    const days = Object.entries(byDate).map(([date, count]) => ({ date, count }));
    const total = days.reduce((s, x) => s + x.count, 0);
    const maxInDay = days.length ? Math.max(...days.map((x) => x.count)) : 0;

    return success(res, 'OK', {
      days,
      totalActivity: total,
      maxPerDay: maxInDay,
    });
  } catch (err) {
    console.error('Activity error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { getMyActivity, getActivityByStudent };
