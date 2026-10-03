import { catchAsync } from '../utils/catchAsync.js';
import { registerUser, loginUser } from '../services/authService.js';
import { AppError } from '../utils/appError.js';

export const register = catchAsync(async (req, res, next) => {
  const { user, token } = await registerUser(req.body);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await loginUser(email, password);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};