const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

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
      const d = row.d ? String(row.d).slice(0, 10) : null;
      if (d) byDate[d] = (byDate[d] || 0) + Number(row.c);
    }
    for (const row of quizDays) {
      const d = row.d ? String(row.d).slice(0, 10) : null;
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

module.exports = { getMyActivity };
