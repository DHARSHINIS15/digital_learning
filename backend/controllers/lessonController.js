const { pool } = require('../config/db');
const { success, error } = require('../utils/response');
const { notifyNewLesson } = require('../utils/notifyHelper');

// Helper: check if user can edit this course (instructor of course or admin)
const canEditCourse = async (courseId, userId, userRole) => {
  if (userRole === 'admin') return true;
  const [rows] = await pool.execute('SELECT instructor_id FROM courses WHERE id = ?', [courseId]);
  return rows.length > 0 && rows[0].instructor_id === userId;
};

const createLesson = async (req, res) => {
  try {
    const courseId = req.params.id;
    const allowed = await canEditCourse(courseId, req.user.id, req.user.role);
    if (!allowed) return error(res, 'You can only add lessons to your own course.', 403);
    const { title, duration_minutes, image_url, contents } = req.body;
    if (!title) return error(res, 'Title is required.', 400);

    const [maxOrder] = await pool.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM lessons WHERE course_id = ?', [courseId]);
    const sort_order = maxOrder[0].next_order;

    const [result] = await pool.execute(
      'INSERT INTO lessons (course_id, title, duration_minutes, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [courseId, title, duration_minutes || 0, image_url || null, sort_order]
    );
    const lessonId = result.insertId;

    if (contents && Array.isArray(contents)) {
      for (let i = 0; i < contents.length; i++) {
        const c = contents[i];
        // START FIX: Database column is 'video_url', not 'content_url'
        const videoUrl = c.video_url || c.content_url || null;
        const textContent = c.text_content || null;

        let contentType = c.content_type;
        if (!contentType) {
          if (videoUrl) contentType = 'video';
          else if (textContent) contentType = 'text';
          else contentType = 'text'; // Fallback
        }

        if (videoUrl || textContent) {
          await pool.execute(
            'INSERT INTO lesson_contents (lesson_id, title, content_type, video_url, text_content, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [lessonId, c.title || 'Untitled', contentType, videoUrl, textContent, i]
          );
        }
      }
    }

    const [rows] = await pool.execute('SELECT * FROM lessons WHERE id = ?', [lessonId]);
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
    const [lessons] = await pool.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC',
      [courseId]
    );

    for (const lesson of lessons) {
      const [contents] = await pool.execute(
        'SELECT * FROM lesson_contents WHERE lesson_id = ? ORDER BY sort_order ASC',
        [lesson.id]
      );
      lesson.contents = contents;
    }

    return success(res, 'OK', { lessons });
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
    const { title, duration_minutes, image_url, contents } = req.body;
    console.log('UpdateLesson body:', JSON.stringify(req.body, null, 2));
    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); values.push(duration_minutes); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }

    if (updates.length > 0) {
      values.push(lessonId);
      await pool.execute(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (contents && Array.isArray(contents)) {
      // Simplest way: clear and re-insert or update? Let's clear and re-insert for now
      await pool.execute('DELETE FROM lesson_contents WHERE lesson_id = ?', [lessonId]);
      for (let i = 0; i < contents.length; i++) {
        const c = contents[i];
        // Frontend sends video_url for video, text_content for text.
        // START FIX: Database column is 'video_url', not 'content_url'
        const videoUrl = c.video_url || c.content_url || null;
        const textContent = c.text_content || null;

        let contentType = c.content_type;
        if (!contentType) {
          if (videoUrl) contentType = 'video';
          else if (textContent) contentType = 'text';
          else contentType = 'text'; // Fallback
        }

        if (videoUrl || textContent) {
          await pool.execute(
            'INSERT INTO lesson_contents (lesson_id, title, content_type, video_url, text_content, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [lessonId, c.title || 'Untitled', contentType, videoUrl, textContent, i]
          );
        }
      }
    }

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
