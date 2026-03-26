const mongoose = require('mongoose');
const FaqCategory = require('../models/faqCategory.model');
const FaqItem = require('../models/faqItem.model');

function normalizeAnchorAliases(input, primarySlug) {
  const p = String(primarySlug || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  let arr = [];
  if (Array.isArray(input)) {
    arr = input.map((s) => String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/^#/, ''));
  } else if (input != null && input !== '') {
    arr = String(input)
      .split(/[,;\n\r]+/)
      .map((s) => s.trim().toLowerCase().replace(/\s+/g, '-').replace(/^#/, ''));
  }
  const cleaned = [...new Set(arr.filter(Boolean))].filter((a) => a !== p);
  return cleaned;
}

/** Chuẩn hoá payload category — heroImage ObjectId / null, sortOrder number */
function normalizeCategoryPayload(body) {
  if (!body || typeof body !== 'object') return {};
  const out = {
    slug: body.slug != null ? String(body.slug).trim().toLowerCase() : undefined,
    title: body.title,
    subtitle: body.subtitle,
    bannerHeadline: body.bannerHeadline,
    sortOrder: body.sortOrder !== undefined && body.sortOrder !== '' ? Number(body.sortOrder) || 0 : undefined,
  };
  if (body.anchorAliases !== undefined) {
    out.anchorAliases = normalizeAnchorAliases(body.anchorAliases, out.slug);
  }
  if (body.heroImage !== undefined) {
    const h = body.heroImage;
    if (h == null || h === '') {
      out.heroImage = null;
    } else if (typeof h === 'object' && h !== null && h._id) {
      out.heroImage = h._id;
    } else if (mongoose.Types.ObjectId.isValid(String(h))) {
      out.heroImage = new mongoose.Types.ObjectId(String(h));
    } else {
      out.heroImage = null;
    }
  }
  Object.keys(out).forEach((k) => {
    if (out[k] === undefined) delete out[k];
  });
  return out;
}

const getPublicTree = async () => {
  const categories = await FaqCategory.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .populate('heroImage', 'url name')
    .lean();
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
  return FaqCategory.find().sort({ sortOrder: 1, createdAt: 1 }).populate('heroImage', 'url name');
};

const createCategory = async (data) => {
  const payload = normalizeCategoryPayload(data);
  const doc = new FaqCategory(payload);
  return doc.save();
};

const updateCategory = async (id, data) => {
  const payload = normalizeCategoryPayload(data);
  return FaqCategory.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
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
