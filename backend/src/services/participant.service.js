const Participant = require('../models/participant.model');
const Booking = require('../models/booking.model');
const certificateService = require('./certificate.service');

const getParticipantsByBookingId = async (bookingId) => {
  return await Participant.find({ bookingId });
};

const getParticipantById = async (id) => {
  return await Participant.findById(id);
};

const createParticipant = async (data) => {
  const newParticipant = new Participant(data);
  return await newParticipant.save();
};

const updateParticipantById = async (id, updateData) => {
  const updated = await Participant.findByIdAndUpdate(id, updateData, { new: true });
  if (updated && updateData.status === 'completed') {
    try {
      await certificateService.createCertificate(updated);
    } catch (err) {
      console.error('Certificate creation failed:', err.message);
    }
  }
  return updated;
};

const updateParticipantReviewStatus = async (id, reviewStatus) => {
  if (!['approved', 'rejected'].includes(reviewStatus)) {
    throw new Error('Trạng thái khách không hợp lệ');
  }

  const participant = await Participant.findById(id);
  if (!participant) {
    return null;
  }

  const booking = await Booking.findById(participant.bookingId).select('status');
  if (!booking) {
    throw new Error('Booking không tồn tại');
  }

  // Chỉ cho phép đổi trạng thái khách khi booking đang ở giai đoạn xử lý
  if (!['HOLD', 'CONFIRMED'].includes(booking.status)) {
    throw new Error('Chỉ được đổi trạng thái khách ở giai đoạn booking (HOLD/CONFIRMED)');
  }

  participant.reviewStatus = reviewStatus;
  await participant.save();
  return participant;
};

const deleteParticipantById = async (id) => {
  return await Participant.findByIdAndDelete(id);
};

module.exports = {
  getParticipantsByBookingId,
  getParticipantById,
  createParticipant,
  updateParticipantById,
  updateParticipantReviewStatus,
  deleteParticipantById
};
