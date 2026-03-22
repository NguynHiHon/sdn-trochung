const Tour = require('../models/tour.model');

const getAllTours = async ({ search, categoryId, caveId, status, tourType, page = 1, limit = 12 }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { 'name.vi': { $regex: search, $options: 'i' } },
      { 'name.en': { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  if (categoryId && categoryId !== 'all') filter.categoryId = categoryId;
  if (caveId && caveId !== 'all') filter.caveId = caveId;
  if (status && status !== 'all') filter.status = status;
  if (tourType && tourType !== 'all') filter.tourType = tourType;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const data = await Tour.find(filter)
    .populate('thumbnail', 'name url')
    .populate('categoryId', 'name')
    .populate('caveId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  const total = await Tour.countDocuments(filter);

  return {
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

const getTourById = async (idOrCode) => {
  const mongoose = require('mongoose');
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrCode);
  const query = isObjectId ? { _id: idOrCode } : { $or: [{ code: idOrCode }, { slug: idOrCode }] };

  return await Tour.findOne(query)
    .populate('thumbnail', 'name url')
    .populate('banner', 'name url')
    .populate('gallery', 'name url')
    .populate('categoryId', 'name')
    .populate('caveId', 'name');
};

const createTour = async (data) => {
  const newTour = new Tour(data);
  return await newTour.save();
};

const updateTourById = async (id, updateData) => {
  return await Tour.findByIdAndUpdate(id, updateData, { new: true })
    .populate('thumbnail', 'name url')
    .populate('gallery', 'name url')
    .populate('categoryId', 'name')
    .populate('caveId', 'name');
};

const deleteTourById = async (id) => {
  return await Tour.findByIdAndDelete(id);
};

module.exports = {
  getAllTours,
  getTourById,
  createTour,
  updateTourById,
  deleteTourById
};
