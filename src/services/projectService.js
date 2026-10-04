import Project from '../models/projectModel.js';
import { AppError } from '../utils/appError.js';
import ApiFeatures from '../utils/apiFeatures.js';

export const getAllProjects = async (queryParams, userId, userRole) => {
  // Build role-based scope filter
  const scopeFilter = {};
  if (userRole === 'DEVELOPER') {
    scopeFilter.$or = [{ createdBy: userId }, { teamMembers: userId }];
  }

  const features = new ApiFeatures(Project.find(), queryParams, scopeFilter);
  features.filter().search(['name', 'description']).sort().paginate();
  await features.countTotal();

  features.query
    .populate('createdBy', 'name email role')
    .populate('teamMembers', 'name email role');

  const data = await features.exec();
  return { data, pagination: features.paginationMeta };
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