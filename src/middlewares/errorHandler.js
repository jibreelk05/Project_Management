import AppError from '../utils/appError.js';

const errorHandler = (err, req, res, next) => {
  // Log error in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.error('SERVER ERROR 💥:', err);
  }

  // Set default values if not provided by the error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Determine if we're in development or production
  // const isDevelopment = process.env.NODE_ENV === 'development'; // moved up

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: isDevelopment ? err.message : 'Something went wrong!',
    ...(isDevelopment && { stack: err.stack }), // Include stack trace in development
    ...(isDevelopment && { error: err }), // Include full error object in development
  });
};

// Handle specific Mongoose errors
errorHandler.handleMongooseErrors = (err, req, res, next) => {
  // Handle CastError (Invalid ID)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    err = new AppError(message, 400);
    return errorHandler(err, req, res, next);
  }

  // Handle Duplicate Key Error (11000)
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400);
    return errorHandler(err, req, res, next);
  }

  // Handle ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = `Invalid input data: ${messages.join('. ')}`;
    err = new AppError(message, 400);
    return errorHandler(err, req, res, next);
  }

  // If none of the above, pass to the main error handler
  return errorHandler(err, req, res, next);
};

export default errorHandler;