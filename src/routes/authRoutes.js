import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../utils/authValidation.js';
import { register, login } from '../controllers/authController.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;