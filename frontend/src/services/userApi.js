import { axiosJWT } from '../config/axiosJWT';

export const getAllUsers = async (params = {}) => {
  const response = await axiosJWT.get('/api/user/all', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosJWT.get(`/api/user/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await axiosJWT.post('/api/user/create', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosJWT.put(`/api/user/${id}`, data);
  return response.data;
};

export const toggleActive = async (id) => {
  const response = await axiosJWT.put(`/api/user/${id}/toggle-active`);
  return response.data;
};

export const resetPassword = async (id, newPassword) => {
  const response = await axiosJWT.put(`/api/user/${id}/reset-password`, { newPassword });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosJWT.delete(`/api/user/${id}`);
  return response.data;
};

export const getStaffList = async () => {
  const response = await axiosJWT.get('/api/user/staff-list');
  return response.data;
};
