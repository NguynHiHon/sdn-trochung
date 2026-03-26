const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['tour', 'gallery', 'banner', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    required: true
  },
  public_id: {
    // Để có thể xoá ảnh trên Cloudinary sau này nếu cần
    type: String,
    required: false
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
