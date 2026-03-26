const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bilingual = {
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
};

const faqItemSchema = new Schema(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'FaqCategory', required: true, index: true },
    /** Đầu mục con của section (vd: Caving & Camping -> hiển thị thành 1.1) */
    groupTitle: { type: bilingual, default: { vi: '', en: '' } },
    question: { type: bilingual, required: true },
    answer: { type: bilingual, required: true },
    /** Link YouTube tuỳ chọn — hiển thị dưới nội dung trả lời */
    youtubeUrl: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqItemSchema.index({ categoryId: 1, sortOrder: 1 });

module.exports = mongoose.model('FaqItem', faqItemSchema);
