const mongoose = require('mongoose');

const bilingual = {
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
};

const faqCategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: bilingual, required: true },
    /** Dòng chữ lớn trên banner đầu /faqs (vd: FAQs). Để trống → dùng nhãn mặc định theo ngôn ngữ */
    bannerHeadline: { type: bilingual, default: { vi: '', en: '' } },
    /** Đoạn mô tả trên banner (dưới headline), giống Oxalis */
    subtitle: { type: bilingual, default: { vi: '', en: '' } },
    /** Ảnh đầu mục FAQ (Media library) */
    heroImage: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    /** Hash # bổ sung cùng trỏ tới khối này (vd: link cũ / nhiều URL một nội dung) */
    anchorAliases: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

faqCategorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('FaqCategory', faqCategorySchema);
