const Participant = require('../models/participant.model');

const VALID_REVIEW_STATUSES = ['pending_review', 'approved', 'rejected', 'completed', 'service_suspended'];

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
  return await Participant.findByIdAndUpdate(id, updateData, { new: true });
};

const updateParticipantAdminStatus = async (id, { reviewStatus, reviewNote, certificateIssued }, adminUserId) => {
  const participant = await Participant.findById(id);
  if (!participant) return null;

  if (reviewStatus !== undefined) {
    if (!VALID_REVIEW_STATUSES.includes(reviewStatus)) {
      throw new Error('Trạng thái duyệt không hợp lệ');
    }
    participant.adminReview.reviewStatus = reviewStatus;
  }

  if (reviewNote !== undefined) {
    participant.adminReview.reviewNote = String(reviewNote || '').trim();
  }

  if (certificateIssued !== undefined) {
    participant.adminReview.certificateIssued = Boolean(certificateIssued);
    participant.adminReview.certificateIssuedAt = certificateIssued ? new Date() : null;
  }

  if (participant.adminReview.reviewStatus === 'completed' && !participant.adminReview.certificateIssued) {
    participant.adminReview.certificateIssued = true;
    participant.adminReview.certificateIssuedAt = new Date();
  }

  participant.adminReview.reviewedAt = new Date();
  participant.adminReview.reviewedBy = adminUserId || null;

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
  updateParticipantAdminStatus,
  deleteParticipantById
};
