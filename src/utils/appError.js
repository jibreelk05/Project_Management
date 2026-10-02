/**
 * Custom Error class for operational errors in the application
 * Extends the native JavaScript Error class
 */
class AppError extends Error {
  /**
   * Create an AppError instance
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace, excluding the constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;