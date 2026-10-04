import Project from '../models/projectModel.js';
import { AppError } from '../utils/appError.js';

export const getAllProjects = async (query, userId, userRole) => {
  const filter = {};

  // DEVELOPER can only see projects they are part of
  if (userRole === 'DEVELOPER') {
    filter.$or = [{ createdBy: userId }, { teamMembers: userId }];
  }

  // Apply status filter if provided
  if (query.status) {
    filter.status = query.status;
  }

  // Apply priority filter if provided
  if (query.priority) {
    filter.priority = query.priority;
  }

  const projects = await Project.find(filter)
    .populate('createdBy', 'name email role')
    .populate('teamMembers', 'name email role')
    .sort({ createdAt: -1 });

  return projects;
};

export const getProjectById = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId)
    .populate('createdBy', 'name email role')
    .populate('teamMembers', 'name email role');

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // DEVELOPER can only view projects they are part of
  if (userRole === 'DEVELOPER') {
    const isMember =
      project.createdBy._id.toString() === userId.toString() ||
      project.teamMembers.some((member) => member._id.toString() === userId.toString());

    if (!isMember) {
      throw new AppError('You do not have permission to view this project', 403);
    }
  }

  return project;
};

export const createProject = async (projectData, userId) => {
  const project = await Project.create({
    ...projectData,
    createdBy: userId,
  });

  return project;
};

export const updateProject = async (projectId, updateData, userId, userRole) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Only ADMIN or the creator (PROJECT_MANAGER) can update
  if (userRole !== 'ADMIN' && project.createdBy.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to update this project', 403);
  }

  Object.assign(project, updateData);
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('createdBy', 'name email role')
    .populate('teamMembers', 'name email role');

  return updatedProject;
};

export const deleteProject = async (projectId, userId, userRole) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Only ADMIN or the creator (PROJECT_MANAGER) can delete
  if (userRole !== 'ADMIN' && project.createdBy.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this project', 403);
  }

  await Project.findByIdAndDelete(projectId);

  return project;
};