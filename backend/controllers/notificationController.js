const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * GET /api/notifications - Current user's notifications
 */
const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    );
    return success(res, 'OK', { notifications: rows });
  } catch (err) {
    console.error('Get notifications error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * POST /api/notifications - Create notification (admin/instructor; e.g. broadcast to course students)
 * Body: { user_id, message, type } or { course_id, message, type } to notify all enrolled
 */
const createNotification = async (req, res) => {
  try {
    const { user_id, course_id, message, type } = req.body;
    const notifType = ['alert', 'recommendation', 'deadline', 'new_content'].includes(type) ? type : 'alert';
    let userIds = [];
    if (user_id) userIds = [user_id];
    if (course_id) {
      const [enrolled] = await pool.execute('SELECT student_id FROM enrollments WHERE course_id = ?', [course_id]);
      userIds = enrolled.map(e => e.student_id);
    }
    if (userIds.length === 0) return error(res, 'Provide user_id or course_id.', 400);
    for (const uid of userIds) {
      await pool.execute(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [uid, message, notifType]
      );
    }
    return success(res, 'Notification(s) created', { count: userIds.length }, 201);
  } catch (err) {
    console.error('Create notification error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * PUT /api/notifications/:id/read - Mark as read
 */
const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return error(res, 'Notification not found.', 404);
    return success(res, 'Marked as read.');
  } catch (err) {
    console.error('Mark read error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { getNotifications, createNotification, markRead };
