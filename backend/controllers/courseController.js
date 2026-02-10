const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * POST /api/courses - Instructor or Admin creates course
 */
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const instructor_id = req.user.role === 'admin' ? (req.body.instructor_id || req.user.id) : req.user.id;
    if (!title) return error(res, 'Title is required.', 400);
    const [result] = await pool.execute(
      'INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)',
      [title, description || '', instructor_id]
    );
    const [rows] = await pool.execute(
      'SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?',
      [result.insertId]
    );
    return success(res, 'Course created successfully', { course: rows[0] }, 201);
  } catch (err) {
    console.error('Create course error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/courses - All authenticated users can list courses
 */
const getCourses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.title, c.description, c.instructor_id, c.created_at, u.name as instructor_name
       FROM courses c LEFT JOIN users u ON c.instructor_id = u.id ORDER BY c.created_at DESC`
    );
    return success(res, 'OK', { courses: rows });
  } catch (err) {
    console.error('Get courses error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/courses/:id
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?`,
      [id]
    );
    if (rows.length === 0) return error(res, 'Course not found.', 404);
    const course = rows[0];
    // Students can only view; instructor can edit own; admin can edit any
    const canEdit = req.user.role === 'admin' || (req.user.role === 'instructor' && course.instructor_id === req.user.id);
    return success(res, 'OK', { course: { ...course, canEdit } });
  } catch (err) {
    console.error('Get course error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * PUT /api/courses/:id - Instructor (own only) or Admin
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT instructor_id FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) return error(res, 'Course not found.', 404);
    if (req.user.role === 'instructor' && existing[0].instructor_id !== req.user.id) {
      return error(res, 'You can only edit your own course.', 403);
    }
    const { title, description } = req.body;
    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (updates.length === 0) return error(res, 'No valid fields to update.', 400);
    values.push(id);
    await pool.execute(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.execute(
      'SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?',
      [id]
    );
    return success(res, 'Course updated successfully', { course: rows[0] });
  } catch (err) {
    console.error('Update course error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * DELETE /api/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.execute('SELECT instructor_id FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) return error(res, 'Course not found.', 404);
    if (req.user.role === 'instructor' && existing[0].instructor_id !== req.user.id) {
      return error(res, 'You can only delete your own course.', 403);
    }
    await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
    return success(res, 'Course deleted successfully.');
  } catch (err) {
    console.error('Delete course error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };
