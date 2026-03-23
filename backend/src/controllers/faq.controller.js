const faqService = require('../services/faq.service');

const getPublicTree = async (req, res) => {
  try {
    const data = await faqService.getPublicTree();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const listCategories = async (req, res) => {
  try {
    const data = await faqService.listCategories();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const doc = await faqService.createCategory(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const doc = await faqService.updateCategory(req.params.id, req.body);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await faqService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Đã xóa nhóm và các câu hỏi' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const listItems = async (req, res) => {
  try {
    const data = await faqService.listItems(req.query.categoryId);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const createItem = async (req, res) => {
  try {
    const doc = await faqService.createItem(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const doc = await faqService.updateItem(req.params.id, req.body);
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    await faqService.deleteItem(req.params.id);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getPublicTree,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listItems,
  createItem,
  updateItem,
  deleteItem,
};
