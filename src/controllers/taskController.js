import { catchAsync } from '../utils/catchAsync.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService.js';

export const getTasks = catchAsync(async (req, res, next) => {
  const tasks = await getAllTasks(req.query, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
});

export const getTask = catchAsync(async (req, res, next) => {
  const task = await getTaskById(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const createNewTask = catchAsync(async (req, res, next) => {
  const task = await createTask(req.body, req.user._id, req.user.role);

  res.status(201).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const updateExistingTask = catchAsync(async (req, res, next) => {
  const task = await updateTask(req.params.id, req.body, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
});

export const removeTask = catchAsync(async (req, res, next) => {
  const task = await deleteTask(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
    data: {
      task,
    },
  });
});