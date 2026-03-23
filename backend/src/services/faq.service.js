const FaqCategory = require('../models/faqCategory.model');
const FaqItem = require('../models/faqItem.model');

const getPublicTree = async () => {
  const categories = await FaqCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const items = await FaqItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const byCat = {};
  for (const it of items) {
    const key = it.categoryId.toString();
    if (!byCat[key]) byCat[key] = [];
    byCat[key].push(it);
  }
  return categories.map((c) => ({
    category: c,
    items: byCat[c._id.toString()] || [],
  }));
};

const listCategories = async () => {
  return FaqCategory.find().sort({ sortOrder: 1, createdAt: 1 });
};

const createCategory = async (data) => {
  const doc = new FaqCategory(data);
  return doc.save();
};

const updateCategory = async (id, data) => {
  return FaqCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteCategory = async (id) => {
  await FaqItem.deleteMany({ categoryId: id });
  return FaqCategory.findByIdAndDelete(id);
};

const listItems = async (categoryId) => {
  const filter = categoryId && categoryId !== 'all' ? { categoryId } : {};
  return FaqItem.find(filter).sort({ sortOrder: 1, createdAt: 1 }).populate('categoryId', 'slug title');
};

const createItem = async (data) => {
  const doc = new FaqItem(data);
  return doc.save();
};

const updateItem = async (id, data) => {
  return FaqItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteItem = async (id) => {
  return FaqItem.findByIdAndDelete(id);
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
