import axiosInstance from '../api/axiosInstance';

export const getTasks = async (params) => {
  const response = await axiosInstance.get('/tasks', { params });
  return response.data;
};

export const createTask = async (data) => {
  const response = await axiosInstance.post('/tasks', data);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await axiosInstance.patch(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(`/tasks/${id}`);
  return response.data;
};