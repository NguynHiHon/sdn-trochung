const Participant = require('../models/participant.model');
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

const deleteParticipantById = async (id) => {
  return await Participant.findByIdAndDelete(id);
};

module.exports = {
  getParticipantsByBookingId,
  getParticipantById,
  createParticipant,
  updateParticipantById,
  deleteParticipantById
};
