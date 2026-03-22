const Media = require('../models/media.model');

/**
 * Lấy toàn bộ danh sách ảnh (hỗ trợ tìm kiếm theo name và type)
 */
const getAllMedia = async ({ search, type, page = 1, limit = 12 }) => {
  const filter = {};
  
  // Tối ưu dùng Server-Side filter
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  
  if (type && type !== 'all') {
    filter.type = type;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Lấy dữ liệu đã được skip và limit
  const data = await Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
  const total = await Media.countDocuments(filter);

  return {
    data,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

/**
 * Láy chi tiết ảnh theo ID
 */
const getMediaById = async (id) => {
  return await Media.findById(id);
};

/**
 * Lưu ảnh mới vào DB
 */
const createMedia = async (data) => {
  const newMedia = new Media(data);
  return await newMedia.save();
};

/**
 * Cập nhật thông tin ảnh
 */
const updateMediaById = async (id, updateData) => {
  return await Media.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Xóa ảnh
 */
const deleteMediaById = async (id) => {
  return await Media.findByIdAndDelete(id);
};

module.exports = {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMediaById,
  deleteMediaById
};
