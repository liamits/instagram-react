/**
 * Send a standardized API response: { success, data, message }
 */
const sendResponse = (res, statusCode, data, message = '') => {
  res.status(statusCode).json({ success: true, data, message });
};

module.exports = { sendResponse };
