const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bilingual = {
  vi: { type: String, default: "" },
  en: { type: String, default: "" },
};

const newsArticleSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "NewsCategory",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: { type: bilingual, required: true },
    excerpt: bilingual,
    content: bilingual,
    /** Link YouTube (watch / youtu.be / embed) — hiển thị nhúng video trên trang bài viết */
    youtubeUrl: { type: String, default: "", trim: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: "Media" },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media" },
    isFeatured: { type: Boolean, default: false, index: true },
    // Backward-compatible mirror field for older data/query paths.
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

newsArticleSchema.index({ categoryId: 1, status: 1, publishedAt: -1 });

module.exports = mongoose.model("NewsArticle", newsArticleSchema);
