const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bilingual = {
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
};

const faqItemSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'FaqCategory', required: true, index: true },
    question: { type: bilingual, required: true },
    answer: { type: bilingual, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqItemSchema.index({ categoryId: 1, sortOrder: 1 });

module.exports = mongoose.model('FaqItem', faqItemSchema);
