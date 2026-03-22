const ParticipantService = require('../services/participant.service');

const getParticipantsByBookingId = async (req, res) => {
  try {
    const records = await ParticipantService.getParticipantsByBookingId(req.params.bookingId);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getParticipantById = async (req, res) => {
  try {
    const record = await ParticipantService.getParticipantById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createParticipant = async (req, res) => {
  try {
    const newRecord = await ParticipantService.createParticipant(req.body);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const updated = await ParticipantService.updateParticipantById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteParticipant = async (req, res) => {
  try {
    await ParticipantService.deleteParticipantById(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getParticipantsByBookingId,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant
};
