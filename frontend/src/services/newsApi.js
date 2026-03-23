import { axiosPublic } from '../config/axiosPublic';
import { axiosJWT } from '../config/axiosJWT';

export const getNewsFeed = async (params = {}) => {
  const res = await axiosPublic.get('/api/news/feed', { params });
  return res.data;
};

export const getNewsCategories = async () => {
  const res = await axiosPublic.get('/api/news/categories');
  return res.data;
};

export const getNewsArticles = async (params = {}) => {
  const res = await axiosPublic.get('/api/news/articles', { params });
  return res.data;
};

export const getNewsArticleBySlug = async (slug) => {
  const res = await axiosPublic.get(`/api/news/articles/${encodeURIComponent(slug)}`);
  return res.data;
};

export const adminListNewsCategories = async () => {
  const res = await axiosJWT.get('/api/news/admin/categories');
  return res.data;
};

export const adminCreateNewsCategory = async (data) => {
  const res = await axiosJWT.post('/api/news/admin/categories', data);
  return res.data;
};

export const adminUpdateNewsCategory = async (id, data) => {
  const res = await axiosJWT.put(`/api/news/admin/categories/${id}`, data);
  return res.data;
};

export const adminDeleteNewsCategory = async (id) => {
  const res = await axiosJWT.delete(`/api/news/admin/categories/${id}`);
  return res.data;
};

export const adminListNewsArticles = async (params = {}) => {
  const res = await axiosJWT.get('/api/news/admin/articles', { params });
  return res.data;
};

export const adminGetNewsArticle = async (id) => {
  const res = await axiosJWT.get(`/api/news/admin/articles/${id}`);
  return res.data;
};

export const adminCreateNewsArticle = async (data) => {
  const res = await axiosJWT.post('/api/news/admin/articles', data);
  return res.data;
};

export const adminUpdateNewsArticle = async (id, data) => {
  const res = await axiosJWT.put(`/api/news/admin/articles/${id}`, data);
  return res.data;
};

export const adminDeleteNewsArticle = async (id) => {
  const res = await axiosJWT.delete(`/api/news/admin/articles/${id}`);
  return res.data;
};
