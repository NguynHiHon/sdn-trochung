import { axiosJWT } from '../config/axiosJWT';

export const getAllTours = async (params = {}) => {
  const response = await axiosJWT.get('/api/tours', { params });
  return response.data;
};

export const getTourById = async (id) => {
  const response = await axiosJWT.get(`/api/tours/${id}`);
  return response.data;
};

export const createTour = async (data) => {
  const response = await axiosJWT.post('/api/tours', data);
  return response.data;
};

export const updateTour = async (id, data) => {
  const response = await axiosJWT.put(`/api/tours/${id}`, data);
  return response.data;
};

export const deleteTour = async (id) => {
  const response = await axiosJWT.delete(`/api/tours/${id}`);
  return response.data;
};
