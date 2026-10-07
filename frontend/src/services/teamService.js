import axiosInstance from '../api/axiosInstance';

export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

export const assignMemberToProject = async (projectId, userId) => {
  const response = await axiosInstance.post(`/projects/${projectId}/members`, {
    userId,
    memberId: userId
  });
  return response.data;
};

export const removeMemberFromProject = async (projectId, userId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/members`, {
    data: { userId, memberId: userId }
  });
  return response.data;
};
