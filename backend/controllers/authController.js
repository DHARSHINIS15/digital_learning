const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { sendEmail } = require('../utils/email');
const { success, error } = require('../utils/response');

// Strict email regex validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (!emailRegex.test(email)) {
      return error(res, 'Invalid email format.', 400);
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
    if (!emailRegex.test(email)) {
      return error(res, 'Invalid email format.', 400);
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

/**
 * POST /api/auth/forgot-password
 * Sends a reset link to the user's email if valid
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return error(res, 'Please provide an email address.', 400);
    }
    if (!emailRegex.test(email)) {
      return error(res, 'Invalid email format.', 400);
    }

    const [users] = await pool.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Return 200 anyway to prevent user enumeration
      return success(res, 'If your email is in our system, you will receive a reset link shortly.');
    }
    const user = users[0];

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry to 1 hour
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. \n\n Please click on the following link, or paste this into your browser to complete the process:\n\n ${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });

    return success(res, 'If your email is in our system, you will receive a reset link shortly.');
  } catch (err) {
    console.error('Forgot password error:', err);
    return error(res, err.message || 'There was an error sending the email. Try again later!', 500);
  }
};

/**
 * POST /api/auth/reset-password
 * Resets the password based on a valid token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return error(res, 'Password must be at least 6 characters.', 400);
    }

    const [users] = await pool.execute(
      'SELECT id, email, reset_token_expiry FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return error(res, 'Token is invalid or has expired.', 400);
    }

    const user = users[0];
    const password_hash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [password_hash, user.id]
    );

    return success(res, 'Password updated successfully. You can now login.');
  } catch (err) {
    console.error('Reset password error:', err);
    return error(res, 'Server error during password reset.', 500);
  }
};

module.exports = { login, register, me, logout, forgotPassword, resetPassword };
