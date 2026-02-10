const { pool } = require('../config/db');
const { success, error } = require('../utils/response');
const { notifyNewLesson } = require('../utils/notifyHelper');

// Helper: check if user can edit this course (instructor of course or admin)
const canEditCourse = async (courseId, userId, userRole) => {
  if (userRole === 'admin') return true;
  const [rows] = await pool.execute('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
  return rows.length > 0 && rows[0].instructor_id === userId;
};

/**
 * POST /api/courses/:id/lessons
 */
const createLesson = async (req, res) => {
  try {
    const courseId = req.params.id;
    const allowed = await canEditCourse(courseId, req.user.id, req.user.role);
    if (!allowed) return error(res, 'You can only add lessons to your own course.', 403);
    const { title, content_type, content_url, duration_minutes } = req.body;
    if (!title) return error(res, 'Title is required.', 400);
    const contentType = ['video', 'pdf', 'link', 'text'].includes(content_type) ? content_type : 'text';
    const [maxOrder] = await pool.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM lessons WHERE course_id = ?', [courseId]);
    const sort_order = maxOrder[0].next_order;
    const [result] = await pool.execute(
      'INSERT INTO lessons (course_id, title, content_type, content_url, duration_minutes, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [courseId, title, contentType, content_url || null, duration_minutes || 0, sort_order]
    );
    const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
    await notifyNewLesson(courseId, title);
    return success(res, 'Lesson created successfully', { lesson: rows[0] }, 201);
  } catch (err) {
    console.error('Create lesson error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/courses/:id/lessons
 */
const getLessons = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC',
      [courseId]
    );
    return success(res, 'OK', { lessons: rows });
  } catch (err) {
    console.error('Get lessons error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * PUT /api/lessons/:id
 */
const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const [lessonRows] = await pool.execute('SELECT course_id FROM lessons WHERE id = ?', [lessonId]);
    if (lessonRows.length === 0) return error(res, 'Lesson not found.', 404);
    const allowed = await canEditCourse(lessonRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'You can only edit lessons in your own course.', 403);
    const { title, content_type, content_url, duration_minutes } = req.body;
    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (content_type !== undefined) { updates.push('content_type = ?'); values.push(content_type); }
    if (content_url !== undefined) { updates.push('content_url = ?'); values.push(content_url); }
    if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); values.push(duration_minutes); }
    if (updates.length === 0) return error(res, 'No valid fields to update.', 400);
    values.push(lessonId);
    await pool.execute(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    return success(res, 'Lesson updated successfully', { lesson: rows[0] });
  } catch (err) {
    console.error('Update lesson error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * DELETE /api/lessons/:id
 */
const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const [lessonRows] = await pool.execute('SELECT course_id FROM lessons WHERE id = ?', [lessonId]);
    if (lessonRows.length === 0) return error(res, 'Lesson not found.', 404);
    const allowed = await canEditCourse(lessonRows[0].course_id, req.user.id, req.user.role);
    if (!allowed) return error(res, 'You can only delete lessons in your own course.', 403);
    await pool.execute('DELETE FROM lessons WHERE id = ?', [lessonId]);
    return success(res, 'Lesson deleted successfully.');
  } catch (err) {
    console.error('Delete lesson error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { createLesson, getLessons, updateLesson, deleteLesson };
