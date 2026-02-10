const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * POST /api/admin/create-user
 * Admin creates instructor or student (no self-registration for students)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return error(res, 'Name, email, password and role are required.', 400);
    }
    if (!['instructor', 'student'].includes(role)) {
      return error(res, 'Role must be instructor or student.', 400);
    }
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return error(res, 'Email already registered.', 400);
    }
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    return success(res, 'User created successfully', { user: rows[0] }, 201);
  } catch (err) {
    console.error('Create user error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return success(res, 'OK', { users: rows });
  } catch (err) {
    console.error('Get users error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * PUT /api/admin/users/:id
 * Update user details and/or role
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    const updates = [];
    const values = [];
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      if (!['admin', 'instructor', 'student'].includes(role)) {
        return error(res, 'Invalid role.', 400);
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (password !== undefined && password.length > 0) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(password_hash);
    }
    if (updates.length === 0) {
      return error(res, 'No valid fields to update.', 400);
    }
    values.push(id);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return error(res, 'User not found.', 404);
    return success(res, 'User updated successfully', { user: rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return error(res, 'Cannot delete your own account.', 400);
    }
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return error(res, 'User not found.', 404);
    }
    return success(res, 'User deleted successfully.');
  } catch (err) {
    console.error('Delete user error:', err);
    return error(res, 'Server error.', 500);
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
