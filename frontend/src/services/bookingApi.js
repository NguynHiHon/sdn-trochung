import { axiosJWT } from '../config/axiosJWT';

export const getAvailability = async (tourId, params = {}) => {
  const response = await axiosJWT.get(`/api/availability/${tourId}`, { params });
  return response.data;
};

export const holdBooking = async (data) => {
  const response = await axiosJWT.post('/api/booking/hold', data);
  return response.data;
};

export const getAllBookings = async (params = {}) => {
  const response = await axiosJWT.get('/api/bookings', { params });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axiosJWT.get(`/api/bookings/${id}`);
  return response.data;
};

export const cancelBookingByAdmin = async (id) => {
  const response = await axiosJWT.post(`/api/booking/cancel/${id}`);
  return response.data;
};
