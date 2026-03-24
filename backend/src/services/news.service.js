const NewsCategory = require('../models/newsCategory.model');
const NewsArticle = require('../models/newsArticle.model');

const listCategoriesPublic = async () => {
  return NewsCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
};

const listCategoriesAdmin = listCategoriesPublic;

const createCategory = async (data) => {
  const doc = new NewsCategory(data);
  return doc.save();
};

const updateCategory = async (id, data) => {
  return NewsCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteCategory = async (id) => {
  const count = await NewsArticle.countDocuments({ categoryId: id });
  if (count > 0) {
    throw new Error('Không xóa được: vẫn còn bài viết trong danh mục này');
  }
  return NewsCategory.findByIdAndDelete(id);
};

const listArticlesPublic = async ({
  categorySlug,
  page = 1,
  limit = 12,
  featured,
  sort = 'latest',
}) => {
  const filter = { status: 'published' };
  if (typeof featured === 'string') {
    if (featured === 'true') {
      filter.$or = [{ isFeatured: true }, { featured: true }];
    }
    if (featured === 'false') {
      filter.$and = [
        { $or: [{ isFeatured: false }, { isFeatured: { $exists: false } }] },
        { $or: [{ featured: false }, { featured: { $exists: false } }] },
      ];
    }
  }
  if (categorySlug) {
    const cat = await NewsCategory.findOne({ slug: categorySlug });
    if (!cat) return { data: [], total: 0, page: 1, totalPages: 0 };
    filter.categoryId = cat._id;
  }
  const skip = (Number(page) - 1) * Number(limit);
  // latest: ưu tiên ngày đăng (publishedAt) → bài vừa xuất bản lên ô 1 lưới; tie-break createdAt
  // oldest: bài đăng sớm nhất trước
  const sortQuery =
    sort === 'oldest'
      ? { publishedAt: 1, createdAt: 1, _id: 1 }
      : { publishedAt: -1, createdAt: -1, _id: -1 };
  const [data, total] = await Promise.all([
    NewsArticle.find(filter)
      .populate('thumbnail', 'url name')
      .populate('coverImage', 'url name')
      .populate('categoryId', 'slug name')
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    NewsArticle.countDocuments(filter),
  ]);
  const limitNum = Number(limit);
  return {
    data,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

const getArticleBySlugPublic = async (slug) => {
  return NewsArticle.findOne({ slug, status: 'published' })
    .populate('thumbnail', 'url name')
    .populate('coverImage', 'url name')
    .populate('categoryId', 'slug name')
    .lean();
};

const getFeed = async (perSection = 6) => {
  const categories = await NewsCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const sections = await Promise.all(
    categories.map(async (cat) => {
      const articles = await NewsArticle.find({ categoryId: cat._id, status: 'published' })
        .populate('thumbnail', 'url name')
        .populate('coverImage', 'url name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(perSection)
        .select('slug title excerpt publishedAt thumbnail coverImage categoryId')
        .lean();
      return { category: cat, articles };
    })
  );
  return sections;
};

const listArticlesAdmin = async ({
  search,
  status,
  categoryId,
  featured,
  page = 1,
  limit = 20,
}) => {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (categoryId && categoryId !== 'all') filter.categoryId = categoryId;
  if (typeof featured === 'string') {
    if (featured === 'true') {
      filter.$or = [{ isFeatured: true }, { featured: true }];
    }
    if (featured === 'false') {
      filter.$and = [
        { $or: [{ isFeatured: false }, { isFeatured: { $exists: false } }] },
        { $or: [{ featured: false }, { featured: { $exists: false } }] },
      ];
    }
  }
  if (search) {
    filter.$or = [
      { slug: { $regex: search, $options: 'i' } },
      { 'title.vi': { $regex: search, $options: 'i' } },
      { 'title.en': { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [data, total] = await Promise.all([
    NewsArticle.find(filter)
      .populate('thumbnail', 'url name')
      .populate('coverImage', 'url name')
      .populate('categoryId', 'slug name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    NewsArticle.countDocuments(filter),
  ]);
  const limitNum = Number(limit);
  return { data, total, page: Number(page), totalPages: Math.ceil(total / limitNum) || 1 };
};

const getArticleByIdAdmin = async (id) => {
  return NewsArticle.findById(id)
    .populate('thumbnail', 'url name')
    .populate('coverImage', 'url name')
    .populate('categoryId', 'slug name')
    .lean();
};

const createArticle = async (data) => {
  const payload = { ...data };
  if (typeof payload.isFeatured === 'string') {
    payload.isFeatured = payload.isFeatured === 'true';
  }
  if (typeof payload.featured === 'string') {
    payload.featured = payload.featured === 'true';
  }
  if (typeof payload.isFeatured !== 'boolean') {
    payload.isFeatured = Boolean(payload.featured);
  }
  payload.featured = Boolean(payload.isFeatured);
  if (payload.status === 'published' && !payload.publishedAt) {
    payload.publishedAt = new Date();
  }
  const doc = new NewsArticle(payload);
  return doc.save();
};

const updateArticle = async (id, data) => {
  const payload = { ...data };
  if (typeof payload.isFeatured === 'string') {
    payload.isFeatured = payload.isFeatured === 'true';
  }
  if (typeof payload.featured === 'string') {
    payload.featured = payload.featured === 'true';
  }
  if (typeof payload.isFeatured !== 'boolean') {
    payload.isFeatured = Boolean(payload.featured);
  }
  payload.featured = Boolean(payload.isFeatured);
  if (payload.status === 'published') {
    const existing = await NewsArticle.findById(id).select('publishedAt status createdAt');
    if (existing && existing.status !== 'published' && !payload.publishedAt) {
      payload.publishedAt = new Date();
    } else if (
      existing?.status === 'published' &&
      !existing.publishedAt &&
      (payload.publishedAt === undefined || payload.publishedAt === null)
    ) {
      // Dữ liệu cũ thiếu publishedAt — lần sửa đầu gán theo createdAt để thứ tự lưới ổn định
      payload.publishedAt = existing.createdAt || new Date();
    }
  }
  return NewsArticle.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    .populate('thumbnail', 'url name')
    .populate('coverImage', 'url name')
    .populate('categoryId', 'slug name');
};

const deleteArticle = async (id) => {
  return NewsArticle.findByIdAndDelete(id);
};

module.exports = {
  listCategoriesPublic,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listArticlesPublic,
  getArticleBySlugPublic,
  getFeed,
  listArticlesAdmin,
  getArticleByIdAdmin,
  createArticle,
  updateArticle,
  deleteArticle,
};
