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

export const cancelBookingByAdmin = async (id, reason = '') => {
  const response = await axiosJWT.post(`/api/booking/cancel/${id}`, { reason });
  return response.data;
};

export const completeBooking = async (id) => {
  const response = await axiosJWT.post(`/api/booking/complete/${id}`);
  return response.data;
};
