import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import ApiFeatures from '../utils/apiFeatures.js';

const taskPopulate = [
  { path: 'project', select: 'name status' },
  { path: 'assignedTo', select: 'name email role' },
];

export const getAllTasks = async (queryParams, userId, userRole) => {
  // Build role-based scope filter
  const scopeFilter = {};

  if (userRole === 'DEVELOPER') {
    const myProjects = await Project.find({
      $or: [{ createdBy: userId }, { teamMembers: userId }],
    }).select('_id');
    scopeFilter.project = { $in: myProjects.map((p) => p._id) };
  } else if (userRole === 'PROJECT_MANAGER') {
    const myProjects = await Project.find({ createdBy: userId }).select('_id');
    scopeFilter.project = { $in: myProjects.map((p) => p._id) };
  }

  const features = new ApiFeatures(Task.find(), queryParams, scopeFilter);
  features.filter().search(['title', 'description']).sort().paginate();
  await features.countTotal();

  features.query.populate(taskPopulate);

  const data = await features.exec();
  return { data, pagination: features.paginationMeta };
};

export const getTaskById = async (taskId, userId, userRole) => {
  const task = await Task.findById(taskId).populate(taskPopulate);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // DEVELOPER can view tasks in projects they belong to (creator or team member)
  if (userRole === 'DEVELOPER') {
    const project = await Project.findById(task.project._id);
    const isMember =
      project &&
      (project.createdBy.toString() === userId.toString() ||
        project.teamMembers.some((member) => member.toString() === userId.toString()));

    if (!isMember) {
      throw new AppError('You do not have permission to view this task', 403);
    }
  }

  // PROJECT_MANAGER can only view tasks in their own projects
  if (userRole === 'PROJECT_MANAGER') {
    const project = await Project.findById(task.project._id);
    if (!project || project.createdBy.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to view this task', 403);
    }
  }

  return task;
};

export const createTask = async (taskData, userId, userRole) => {
  const project = await Project.findById(taskData.project);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // PROJECT_MANAGER can only create tasks under projects they created
  if (userRole === 'PROJECT_MANAGER' && project.createdBy.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to create tasks in this project', 403);
  }

  // Prevent assigning tasks to a non-existent user
  if (taskData.assignedTo) {
    const assignee = await User.findById(taskData.assignedTo);
    if (!assignee) {
      throw new AppError('Assigned user not found', 404);
    }
  }

  const task = await Task.create(taskData);

  return task;
};

export const updateTask = async (taskId, updateData, userId, userRole) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (userRole === 'DEVELOPER') {
    // Developers can ONLY change the status of tasks assigned to them
    const isAssigned = task.assignedTo && task.assignedTo.toString() === userId.toString();
    if (!isAssigned) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    const fields = Object.keys(updateData);
    if (fields.length !== 1 || fields[0] !== 'status') {
      throw new AppError('Developers can only update the status of a task', 403);
    }

    task.status = updateData.status;
  } else {
    // PROJECT_MANAGER can only update tasks in their own projects (ADMIN bypasses)
    if (userRole === 'PROJECT_MANAGER') {
      const project = await Project.findById(task.project);
      if (!project || project.createdBy.toString() !== userId.toString()) {
        throw new AppError('You do not have permission to update this task', 403);
      }
    }

    Object.assign(task, updateData);
  }

  await task.save();

  const updatedTask = await Task.findById(taskId).populate(taskPopulate);

  return updatedTask;
};

export const deleteTask = async (taskId, userId, userRole) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // PROJECT_MANAGER can only delete tasks in their own projects (ADMIN bypasses)
  if (userRole === 'PROJECT_MANAGER') {
    const project = await Project.findById(task.project);
    if (!project || project.createdBy.toString() !== userId.toString()) {
      throw new AppError('You do not have permission to delete this task', 403);
    }
  }

  await Task.findByIdAndDelete(taskId);

  return task;
};