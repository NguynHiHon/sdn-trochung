const Participant = require('../models/participant.model');

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
