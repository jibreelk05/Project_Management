import { AppError } from '../utils/appError.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      const message = `Invalid input data: ${errors}`;
      return next(new AppError(message, 400));
    }
    // If validation passes, replace req.body with the sanitized data
    req.body = result.data;
    next();
  };
};