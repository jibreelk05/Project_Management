import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { createProjectSchema, updateProjectSchema } from '../utils/projectValidation.js';
import {
  getProjects,
  getProject,
  createNewProject,
  updateExistingProject,
  removeProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { isProjectMember } from '../middlewares/guardMiddleware.js';

const router = Router();

// All project routes require authentication
router.use(protect);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Get all projects (scoped by role)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: -createdAt }
 *         description: Comma-separated sort fields (prefix with - for desc)
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive search across name and description
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, COMPLETED, CANCELLED] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *     responses:
 *       200:
 *         description: Paginated list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 results: { type: integer }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 */
router
  .route('/')
  .get(getProjects)
  .post(restrictTo('PROJECT_MANAGER', 'ADMIN'), validate(createProjectSchema), createNewProject);

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a single project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Project ObjectId
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project (manager-only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project (manager-only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project deleted
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/:id')
  .get(isProjectMember, getProject)
  .patch(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, validate(updateProjectSchema), updateExistingProject)
  .delete(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, removeProject);

router
  .route('/:id/members')
  .post(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, addProjectMember)
  .delete(restrictTo('PROJECT_MANAGER', 'ADMIN'), isProjectMember, removeProjectMember);

export default router;