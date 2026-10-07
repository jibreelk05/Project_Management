import { catchAsync } from '../utils/catchAsync.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
} from '../services/projectService.js';
import { AppError } from '../utils/appError.js';

export const getProjects = catchAsync(async (req, res, next) => {
  const { data: projects, pagination } = await getAllProjects(req.query, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    pagination,
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

export const addProjectMember = catchAsync(async (req, res, next) => {
  const memberId = req.body.userId || req.body.memberId || req.body.developerId;

  if (!memberId) {
    throw new AppError('Member ID is required', 400);
  }

  const project = await addMemberToProject(req.params.id, memberId, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});

export const removeProjectMember = catchAsync(async (req, res, next) => {
  const memberId = req.body.userId || req.body.memberId || req.body.developerId;

  if (!memberId) {
    throw new AppError('Member ID is required', 400);
  }

  const project = await removeMemberFromProject(req.params.id, memberId, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: {
      project,
    },
  });
});