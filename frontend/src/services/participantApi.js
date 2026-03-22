import { axiosJWT } from '../config/axiosJWT';

export const getParticipantsByBookingId = async (bookingId) => {
  const response = await axiosJWT.get(`/api/participants/booking/${bookingId}`);
  return response.data;
};
