import { axiosJWT } from '../config/axiosJWT';

export const getAllCaves = async (params = {}) => {
  const response = await axiosJWT.get('/api/caves', { params });
  return response.data;
};

export const getCaveById = async (id) => {
  const response = await axiosJWT.get(`/api/caves/${id}`);
  return response.data;
};

export const createCave = async (data) => {
  const response = await axiosJWT.post('/api/caves', data);
  return response.data;
};

export const updateCave = async (id, data) => {
  const response = await axiosJWT.put(`/api/caves/${id}`, data);
  return response.data;
};

export const deleteCave = async (id) => {
  const response = await axiosJWT.delete(`/api/caves/${id}`);
  return response.data;
};
