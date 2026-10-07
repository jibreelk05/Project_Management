import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import { getAllUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', protect, getAllUsers);

export default router;
