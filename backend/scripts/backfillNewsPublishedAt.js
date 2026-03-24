/**
 * Gán publishedAt cho bài tin đã xuất bản nhưng chưa có ngày xuất bản.
 * Dùng createdAt làm ngày đăng → sort "latest" (mới nhất trước) khớp thời điểm tạo bài.
 *
 * Chạy từ thư mục backend (có file .env với MONGO_URL):
 *   npm run backfill:news-published-at
 */
require('dotenv').config();
const mongoose = require('mongoose');
const NewsArticle = require('../src/models/newsArticle.model');

async function main() {
  if (!process.env.MONGO_URL) {
    console.error('Thiếu MONGO_URL trong .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  const filter = {
    status: 'published',
    $or: [{ publishedAt: null }, { publishedAt: { $exists: false } }],
  };

  const cursor = NewsArticle.find(filter).select('_id createdAt').cursor();
  let updated = 0;
  for await (const doc of cursor) {
    const at = doc.createdAt || new Date();
    await NewsArticle.updateOne({ _id: doc._id }, { $set: { publishedAt: at } });
    updated += 1;
  }

  console.log(`Đã cập nhật publishedAt cho ${updated} bài (theo createdAt).`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
