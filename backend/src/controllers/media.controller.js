const MediaService = require('../services/media.service');

const getAllMedia = async (req, res) => {
  try {
    const result = await MediaService.getAllMedia(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMediaById = async (req, res) => {
  try {
    const media = await MediaService.getMediaById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
    res.status(200).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMedia = async (req, res) => {
  try {
    const { name, type, url, public_id } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Thiếu name hoặc url' });
    }
    const newMedia = await MediaService.createMedia({ name, type, url, public_id });
    res.status(201).json({ success: true, data: newMedia });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMedia = async (req, res) => {
  try {
    const updatedMedia = await MediaService.updateMediaById(req.params.id, req.body);
    if (!updatedMedia) return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
    res.status(200).json({ success: true, data: updatedMedia });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const deletedMedia = await MediaService.deleteMediaById(req.params.id);
    if (!deletedMedia) return res.status(404).json({ success: false, message: 'Không tìm thấy ảnh' });
    res.status(200).json({ success: true, message: 'Xoá ảnh thành công', data: deletedMedia });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia
};
