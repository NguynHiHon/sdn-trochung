import { axiosJWT } from '../config/axiosJWT';

export const getParticipantsByBookingId = async (bookingId) => {
  const response = await axiosJWT.get(`/api/participants/booking/${bookingId}`);
  return response.data;
};

export const updateParticipantAdminStatus = async (participantId, payload) => {
  const response = await axiosJWT.patch(`/api/participants/${participantId}/admin-status`, payload);
  return response.data;
};
