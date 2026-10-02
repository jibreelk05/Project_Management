import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  // Create new user
  const user = await User.create(userData);

  // Generate token
  const token = signToken(user._id);

  // Return user object and token (without password)
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

export const loginUser = async (email, password) => {
  // Find user and explicitly select password field
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists and password matches
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = signToken(user._id);

  // Return user object and token (without password)
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};