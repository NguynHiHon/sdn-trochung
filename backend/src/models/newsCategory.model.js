const mongoose = require('mongoose');

const bilingual = {
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
};

const newsCategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: bilingual, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

newsCategorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('NewsCategory', newsCategorySchema);
