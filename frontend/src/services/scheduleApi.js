import { axiosJWT } from '../config/axiosJWT';

export const getAllSchedules = async (params = {}) => {
  const response = await axiosJWT.get('/api/schedules', { params });
  return response.data;
};

export const getScheduleById = async (id) => {
  const response = await axiosJWT.get(`/api/schedules/${id}`);
  return response.data;
};

export const createSchedule = async (data) => {
  const response = await axiosJWT.post('/api/schedules', data);
  return response.data;
};

export const bulkCreateSchedules = async (tourId, dates) => {
  const response = await axiosJWT.post('/api/schedules/bulk', { tourId, dates });
  return response.data;
};

export const updateSchedule = async (id, data) => {
  const response = await axiosJWT.put(`/api/schedules/${id}`, data);
  return response.data;
};

export const completeSchedule = async (id) => {
  const response = await axiosJWT.post(`/api/schedules/${id}/complete`);
  return response.data;
};

export const startSchedule = async (id) => {
  const response = await axiosJWT.post(`/api/schedules/${id}/start`);
  return response.data;
};

export const cancelSchedule = async (id) => {
  const response = await axiosJWT.post(`/api/schedules/${id}/cancel`);
  return response.data;
};

export const deleteSchedule = async (id) => {
  const response = await axiosJWT.delete(`/api/schedules/${id}`);
  return response.data;
};
