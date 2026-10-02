/**
 * Higher-order function to wrap async route handlers and catch errors
 * Passes caught errors to the Express error handling middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function that handles errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;