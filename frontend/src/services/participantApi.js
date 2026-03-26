import { axiosJWT } from '../config/axiosJWT';

export const getParticipantsByBookingId = async (bookingId) => {
  const response = await axiosJWT.get(`/api/participants/booking/${bookingId}`);
  return response.data;
};

export const updateParticipant = async (participantId, data) => {
  const response = await axiosJWT.put(`/api/participants/${participantId}`, data);
  return response.data;
};

export const updateParticipantReviewStatus = async (participantId, reviewStatus) => {
  const response = await axiosJWT.patch(`/api/participants/${participantId}/review-status`, { reviewStatus });
  return response.data;
}
