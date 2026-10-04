import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { createTaskSchema, updateTaskSchema } from '../validations/taskValidation.js';
import {
  getTasks,
  getTask,
  createNewTask,
  updateExistingTask,
  removeTask,
} from '../controllers/taskController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { canAccessTask } from '../middlewares/guardMiddleware.js';

const router = Router();

// All task routes require authentication
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(restrictTo('PROJECT_MANAGER', 'ADMIN'), validate(createTaskSchema), createNewTask);

router
  .route('/:id')
  .get(canAccessTask, getTask)
  .patch(canAccessTask, validate(updateTaskSchema), updateExistingTask)
  .delete(restrictTo('PROJECT_MANAGER', 'ADMIN'), canAccessTask, removeTask);

export default router;