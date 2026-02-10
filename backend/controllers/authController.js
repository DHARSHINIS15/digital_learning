const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email and password are required.', 400);
    }
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return error(res, 'Invalid email or password.', 401);
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return error(res, 'Invalid email or password.', 401);
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return success(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Server error during login.', 500);
  }
};

/**
 * POST /api/auth/register
 * Public registration for new students
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return error(res, 'Name, email and password are required.', 400);
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return error(res, 'Email already registered.', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const role = 'student';

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return success(
      res,
      'Registration successful',
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      201
    );
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Server error during registration.', 500);
  }
};

/**
 * GET /api/auth/me
 * Get current user from JWT
 */
const me = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return error(res, 'User not found.', 404);
    }
    return success(res, 'OK', { user: rows[0] });
  } catch (err) {
    console.error('Me error:', err);
    return error(res, 'Server error.', 500);
  }
};

/**
 * POST /api/auth/logout
 * Client should remove token; optional blacklist can be added later
 */
const logout = async (req, res) => {
  return success(res, 'Logged out successfully.');
};

module.exports = { login, register, me, logout };
