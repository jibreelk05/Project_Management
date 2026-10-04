import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { createProjectSchema, updateProjectSchema } from '../utils/projectValidation.js';
import {
  getProjects,
  getProject,
  createNewProject,
  updateExistingProject,
  removeProject,
} from '../controllers/projectController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { isProjectMember } from '../middlewares/guardMiddleware.js';

const router = Router();

// All project routes require authentication
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(restrictTo('PROJECT_MANAGER', 'ADMIN'), validate(createProjectSchema), createNewProject);

router
  .route('/:id')
  .get(isProjectMember, getProject)
  .patch(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, validate(updateProjectSchema), updateExistingProject)
  .delete(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, removeProject);

export default router;