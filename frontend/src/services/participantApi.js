import { axiosJWT } from '../config/axiosJWT';

export const getParticipantsByBookingId = async (bookingId) => {
  const response = await axiosJWT.get(`/api/participants/booking/${bookingId}`);
  return response.data;
};

export const updateParticipant = async (id, data) => {
  const response = await axiosJWT.put(`/api/participants/${id}`, data);
  return response.data;
};
