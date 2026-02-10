const { error } = require('../utils/response');

/**
 * Restrict route access by role. Pass allowed roles as arguments.
 * Usage: roleCheck('admin'), roleCheck('admin', 'instructor')
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }
    return error(res, 'Access denied. Insufficient permissions.', 403);
  };
};

module.exports = { roleCheck };
