import { axiosPublic } from '../config/axiosPublic';
import { axiosJWT } from '../config/axiosJWT';

export const getFaqTree = async () => {
  const res = await axiosPublic.get('/api/faqs');
  return res.data;
};

export const adminListFaqCategories = async () => {
  const res = await axiosJWT.get('/api/faqs/admin/categories');
  return res.data;
};

export const adminCreateFaqCategory = async (data) => {
  const res = await axiosJWT.post('/api/faqs/admin/categories', data);
  return res.data;
};

export const adminUpdateFaqCategory = async (id, data) => {
  const res = await axiosJWT.put(`/api/faqs/admin/categories/${id}`, data);
  return res.data;
};

export const adminDeleteFaqCategory = async (id) => {
  const res = await axiosJWT.delete(`/api/faqs/admin/categories/${id}`);
  return res.data;
};

export const adminListFaqItems = async (params = {}) => {
  const res = await axiosJWT.get('/api/faqs/admin/items', { params });
  return res.data;
};

export const adminCreateFaqItem = async (data) => {
  const res = await axiosJWT.post('/api/faqs/admin/items', data);
  return res.data;
};

export const adminUpdateFaqItem = async (id, data) => {
  const res = await axiosJWT.put(`/api/faqs/admin/items/${id}`, data);
  return res.data;
};

export const adminDeleteFaqItem = async (id) => {
  const res = await axiosJWT.delete(`/api/faqs/admin/items/${id}`);
  return res.data;
};
