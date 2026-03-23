const newsService = require('../services/news.service');

const listCategoriesPublic = async (req, res) => {
  try {
    const data = await newsService.listCategoriesPublic();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const per = Math.min(Number(req.query.perSection) || 6, 20);
    const data = await newsService.getFeed(per);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const listArticlesPublic = async (req, res) => {
  try {
    const result = await newsService.listArticlesPublic(req.query);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const article = await newsService.getArticleBySlugPublic(req.params.slug);
    if (!article) return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    res.json({ success: true, data: article });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const listCategoriesAdmin = async (req, res) => {
  try {
    const data = await newsService.listCategoriesAdmin();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const doc = await newsService.createCategory(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const doc = await newsService.updateCategory(req.params.id, req.body);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await newsService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const listArticlesAdmin = async (req, res) => {
  try {
    const result = await newsService.listArticlesAdmin(req.query);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const getArticleByIdAdmin = async (req, res) => {
  try {
    const doc = await newsService.getArticleByIdAdmin(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createArticle = async (req, res) => {
  try {
    const doc = await newsService.createArticle(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const doc = await newsService.updateArticle(req.params.id, req.body);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    await newsService.deleteArticle(req.params.id);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  listCategoriesPublic,
  getFeed,
  listArticlesPublic,
  getArticleBySlug,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listArticlesAdmin,
  getArticleByIdAdmin,
  createArticle,
  updateArticle,
  deleteArticle,
};
