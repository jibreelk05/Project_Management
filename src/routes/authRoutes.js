import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../utils/authValidation.js';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;