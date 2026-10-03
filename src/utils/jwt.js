import jwt from 'jsonwebtoken';

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};