import { axiosJWT } from '../config/axiosJWT';

// Lấy danh sách ảnh với tham số tìm kiếm
export const getAllMedia = async (params = {}) => {
  const response = await axiosJWT.get('/api/media', { params });
  return response.data; // trả về { success, data }
};

// Lưu ảnh mới
export const createMedia = async (mediaData) => {
  const response = await axiosJWT.post('/api/media', mediaData);
  return response.data;
};

// Cập nhật ảnh (nếu cần đổi tên, đổi loại)
export const updateMedia = async (id, updateData) => {
  const response = await axiosJWT.put(`/api/media/${id}`, updateData);
  return response.data;
};

// Xóa ảnh
export const deleteMedia = async (id) => {
  const response = await axiosJWT.delete(`/api/media/${id}`);
  return response.data;
};
