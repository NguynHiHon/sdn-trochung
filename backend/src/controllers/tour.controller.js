const TourService = require('../services/tour.service');

const getAllTours = async (req, res) => {
  try {
    const result = await TourService.getAllTours(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await TourService.getTourById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTour = async (req, res) => {
  try {
    const newTour = await TourService.createTour(req.body);
    res.status(201).json({ success: true, data: newTour });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateTour = async (req, res) => {
  try {
    const updated = await TourService.updateTourById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTour = async (req, res) => {
  try {
    const deleted = await TourService.deleteTourById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy tour' });
    res.status(200).json({ success: true, message: 'Xóa tour thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllTours, getTourById, createTour, updateTour, deleteTour };
