const mongoose = require('mongoose');

const bilingual = {
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
};

const faqCategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: bilingual, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqCategorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('FaqCategory', faqCategorySchema);
