const Cave = require('../models/cave.model');

const getAllCaves = async ({ search, heritageLevel, page = 1, limit = 12 }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { 'name.vi': { $regex: search, $options: 'i' } },
      { 'name.en': { $regex: search, $options: 'i' } }
    ];
  }

  if (heritageLevel && heritageLevel !== 'all') {
    filter.heritageLevel = heritageLevel;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const data = await Cave.find(filter)
    .populate('thumbnail', 'name url')
    .populate('gallery', 'name url')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  const total = await Cave.countDocuments(filter);

  return {
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

const getCaveById = async (id) => {
  return await Cave.findById(id)
    .populate('thumbnail', 'name url')
    .populate('gallery', 'name url');
};

const createCave = async (data) => {
  const newCave = new Cave(data);
  return await newCave.save();
};

const updateCaveById = async (id, updateData) => {
  return await Cave.findByIdAndUpdate(id, updateData, { new: true })
    .populate('thumbnail', 'name url')
    .populate('gallery', 'name url');
};

const deleteCaveById = async (id) => {
  return await Cave.findByIdAndDelete(id);
};

module.exports = {
  getAllCaves,
  getCaveById,
  createCave,
  updateCaveById,
  deleteCaveById
};
