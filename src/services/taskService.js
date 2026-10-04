import Task from '../models/taskModel.js';
import Project from '../models/projectModel.js';
import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';

const taskPopulate = [
  { path: 'project', select: 'name status' },
  { path: 'assignedTo', select: 'name email role' },
];

export const getAllTasks = async (query, userId, userRole) => {
  const filter = {};

  // Apply query filters
  if (query.status) {
    filter.status = query.status;
  }

  // Role-based scoping
  if (userRole === 'DEVELOPER') {
    // Developers can only see tasks assigned to them
    filter.assignedTo = userId;
  } else if (userRole === 'PROJECT_MANAGER') {
    // Managers can only see tasks in projects they created
    const myProjects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = myProjects.map((p) => p._id);
    filter.project = { $in: projectIds };
  }

  // Apply projectId filter (after scoping so it narrows, not widens)
  if (query.projectId) {
    filter.project = query.projectId;
  }

  const tasks = await Task.find(filter).populate(taskPopulate).sort({ createdAt: -1 });

  return tasks;
};

export const getTaskById = async (taskId, userId, userRole) => {
  const task = await Task.findById(taskId).populate(taskPopulate);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // DEVELOPER can only view tasks assigned to them
  if (userRole === 'DEVELOPER') {
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === userId.toString();
    if (!isAssigned) {
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