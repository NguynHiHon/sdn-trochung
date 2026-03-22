import { axiosJWT } from '../config/axiosJWT';

export const assignBooking = async (data) => {
  const response = await axiosJWT.post('/api/assignments', data);
  return response.data;
};

export const getAssignments = async (params = {}) => {
  const response = await axiosJWT.get('/api/assignments', { params });
  return response.data;
};

export const updateAssignmentStatus = async (id, status) => {
  const response = await axiosJWT.put(`/api/assignments/${id}/status`, { status });
  return response.data;
};
