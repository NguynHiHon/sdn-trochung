const CaveService = require('../services/cave.service');

const getAllCaves = async (req, res) => {
  try {
    const result = await CaveService.getAllCaves(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCaveById = async (req, res) => {
  try {
    const cave = await CaveService.getCaveById(req.params.id);
    if (!cave) return res.status(404).json({ success: false, message: 'Không tìm thấy hang động' });
    res.status(200).json({ success: true, data: cave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCave = async (req, res) => {
  try {
    const newCave = await CaveService.createCave(req.body);
    res.status(201).json({ success: true, data: newCave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCave = async (req, res) => {
  try {
    const updated = await CaveService.updateCaveById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy hang động' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCave = async (req, res) => {
  try {
    const deleted = await CaveService.deleteCaveById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy hang động' });
    res.status(200).json({ success: true, message: 'Xóa hang động thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCaves, getCaveById, createCave, updateCave, deleteCave };
