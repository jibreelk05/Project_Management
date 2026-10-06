import axiosInstance from '../api/axiosInstance';

export const getProjects = async (params) => {
  const response = await axiosInstance.get('/projects', { params });
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data) => {
  const response = await axiosInstance.post('/projects', data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await axiosInstance.patch(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data;
};