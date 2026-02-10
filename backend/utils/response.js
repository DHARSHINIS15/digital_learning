/**
 * Consistent API response helpers
 */
const success = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message = 'Error', statusCode = 400, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: data || {},
  });
};

module.exports = { success, error };
