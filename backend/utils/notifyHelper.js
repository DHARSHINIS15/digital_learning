const { pool } = require('../config/db');

/**
 * Notify all enrolled students when new lesson is added to a course
 */
async function notifyNewLesson(courseId, lessonTitle) {
  try {
    const [enrolled] = await pool.execute('SELECT student_id FROM enrollments WHERE course_id = ?', [courseId]);
    const message = `New content added: "${lessonTitle}"`;
    for (const e of enrolled) {
      await pool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [e.student_id, message, 'new_content']
      );
    }
  } catch (err) {
    console.error('notifyNewLesson error:', err);
  }
}

/**
 * Create low engagement / deadline alerts (can be called by a cron or scheduled job)
 * For now we expose logic; could be triggered by GET /api/notifications/check-alerts
 */
async function createLowEngagementAlerts() {
  try {
    const [students] = await pool.execute(
      "SELECT id, name FROM users WHERE role = 'student'"
    );
    for (const s of students) {
      const [lastActive] = await pool.execute(
        'SELECT MAX(last_accessed) as last FROM progress_tracking WHERE student_id = ?',
        [s.id]
      );
      const last = lastActive[0]?.last;
      if (!last) continue;
      const daysSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7) {
        await pool.execute(
          'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
          [s.id, 'You have been inactive for 7+ days. Resume your learning to stay on track!', 'alert']
        );
      }
    }
  } catch (err) {
    console.error('createLowEngagementAlerts error:', err);
  }
}

module.exports = { notifyNewLesson, createLowEngagementAlerts };
