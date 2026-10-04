import mongoose from 'mongoose';
import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const userIsCreator = (project, userId) =>
  project && project.createdBy && project.createdBy.toString() === userId.toString();

const userIsTeamMember = (project, userId) =>
  project &&
  project.teamMembers &&
  project.teamMembers.some((member) => member.toString() === userId.toString());

/**
 * Resource guard: ensures req.user is the project creator (manager) OR a team member.
 * Admin role bypasses membership enforcement (consistent with existing auth rules).
 */
export const isProjectMember = catchAsync(async (req, res, next) => {
  // ADMIN bypasses membership enforcement
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Extract projectId from params, body, or query
  const projectId =
    req.params.id || req.params.projectId || req.body.projectId || req.query.projectId;

  if (!projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  if (!isValidObjectId(projectId)) {
    return next(new AppError('Invalid project ID', 400));
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const isMember = userIsCreator(project, req.user._id) || userIsTeamMember(project, req.user._id);

  if (!isMember) {
    return next(new AppError('You are not a member of this project', 403));
  }

  // Attach the loaded project for downstream reuse
  req.project = project;
  next();
});

/**
 * Resource guard for tasks: loads the task, inspects its parent project, and
 * enforces role-specific access:
 *   - PROJECT_MANAGER: full access only to tasks in projects they own/manage.
 *   - DEVELOPER: read access if they belong to the task's project; write
 *     (status update) allowed only if the task is assigned to them.
 * Admin role bypasses task-level enforcement.
 */
export const canAccessTask = catchAsync(async (req, res, next) => {
  // ADMIN bypasses task-level enforcement
  if (req.user.role === 'ADMIN') {
    return next();
  }

  const taskId = req.params.id || req.params.taskId;

  if (!taskId) {
    return next(new AppError('Task ID is required', 400));
  }

  if (!isValidObjectId(taskId)) {
    return next(new AppError('Invalid task ID', 400));
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  const project = await Project.findById(task.project);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  const isWriteRequest = req.method !== 'GET';

  if (req.user.role === 'PROJECT_MANAGER') {
    // Full access only to tasks in projects they own/manage
    if (!userIsCreator(project, req.user._id)) {
      return next(new AppError('You do not have permission to access this task', 403));
    }
  } else if (req.user.role === 'DEVELOPER') {
    // Read access: must belong to the task's project
    const isMember =
      userIsCreator(project, req.user._id) || userIsTeamMember(project, req.user._id);

    if (!isMember) {
      return next(new AppError('You are not a member of this project', 403));
    }

    // Write access (status updates only): must be the assignee
    if (isWriteRequest) {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return next(new AppError('You do not have permission to modify this task', 403));
      }
    }
  }

  // Attach the loaded task for downstream reuse
  req.task = task;
  next();
});