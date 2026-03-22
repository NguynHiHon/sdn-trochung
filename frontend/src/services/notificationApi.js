import { axiosJWT } from '../config/axiosJWT';

export const getMyNotifications = async (params = {}) => {
  const response = await axiosJWT.get('/api/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosJWT.get('/api/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosJWT.put(`/api/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosJWT.put('/api/notifications/read-all');
  return response.data;
};
