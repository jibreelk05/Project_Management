import { catchAsync } from '../utils/catchAsync.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService.js';

export const getProjects = catchAsync(async (req, res, next) => {
  const projects = await getAllProjects(req.query, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
    },
  });
});

export const getProject = catchAsync(async (req, res, next) => {
  const project = await getProjectById(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const createNewProject = catchAsync(async (req, res, next) => {
  const project = await createProject(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const updateExistingProject = catchAsync(async (req, res, next) => {
  const project = await updateProject(req.params.id, req.body, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const removeProject = catchAsync(async (req, res, next) => {
  const project = await deleteProject(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully',
    data: {
      project,
    },
  });
});