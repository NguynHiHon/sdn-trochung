const Tour = require('../models/tour.model');

const VALID_TOUR_TYPES = ['multiday', 'overnight', 'daytour', 'family'];
const VALID_STATUSES = ['draft', 'published', 'archived'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validateBasicTourInfo = (tourData) => {
  const errors = [];

  if (!isNonEmptyString(tourData?.name?.vi)) errors.push('Tên tour (VI)');
  if (!isNonEmptyString(tourData?.name?.en)) errors.push('Tên tour (EN)');
  if (!isNonEmptyString(tourData?.description?.vi)) errors.push('Mô tả ngắn (VI)');
  if (!isNonEmptyString(tourData?.description?.en)) errors.push('Mô tả ngắn (EN)');
  if (!isNonEmptyString(tourData?.code)) errors.push('Mã tour');
  if (!isNonEmptyString(tourData?.slug)) errors.push('Slug');

  const priceVND = Number(tourData?.priceVND);
  if (!Number.isFinite(priceVND) || priceVND <= 0) errors.push('Giá (VND) > 0');

  const durationDays = Number(tourData?.durationDays);
  if (!Number.isFinite(durationDays) || durationDays <= 0) errors.push('Số ngày > 0');

  const adventureLevel = Number(tourData?.adventureLevel);
  if (!Number.isInteger(adventureLevel) || adventureLevel < 1 || adventureLevel > 6) {
    errors.push('Độ khó từ 1 đến 6');
  }

  if (!VALID_TOUR_TYPES.includes(tourData?.tourType)) errors.push('Loại tour');
  if (!VALID_STATUSES.includes(tourData?.status)) errors.push('Trạng thái');

  if (errors.length > 0) {
    throw new Error(`Thông số cơ bản không hợp lệ: ${errors.join(', ')}`);
  }
};

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
  const existingTour = await Tour.findById(id);
  if (!existingTour) return null;

  const normalizedUpdate = { ...updateData };
  if (normalizedUpdate.code !== undefined && typeof normalizedUpdate.code === 'string') {
    normalizedUpdate.code = normalizedUpdate.code.trim();
  }
  if (normalizedUpdate.slug !== undefined && typeof normalizedUpdate.slug === 'string') {
    normalizedUpdate.slug = normalizedUpdate.slug.trim();
  }

  const tourForValidation = {
    name: {
      vi: normalizedUpdate?.name?.vi ?? existingTour?.name?.vi,
      en: normalizedUpdate?.name?.en ?? existingTour?.name?.en,
    },
    description: {
      vi: normalizedUpdate?.description?.vi ?? existingTour?.description?.vi,
      en: normalizedUpdate?.description?.en ?? existingTour?.description?.en,
    },
    code: normalizedUpdate?.code ?? existingTour?.code,
    slug: normalizedUpdate?.slug ?? existingTour?.slug,
    priceVND: normalizedUpdate?.priceVND ?? existingTour?.priceVND,
    durationDays: normalizedUpdate?.durationDays ?? existingTour?.durationDays,
    adventureLevel: normalizedUpdate?.adventureLevel ?? existingTour?.adventureLevel,
    tourType: normalizedUpdate?.tourType ?? existingTour?.tourType,
    status: normalizedUpdate?.status ?? existingTour?.status,
  };

  validateBasicTourInfo(tourForValidation);

  return await Tour.findByIdAndUpdate(id, normalizedUpdate, { new: true, runValidators: true, context: 'query' })
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
