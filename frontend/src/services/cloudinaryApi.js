import { axiosJWT } from '../config/axiosJWT';
import axios from 'axios'; // We use raw axios for talking to Cloudinary API to avoid JWT interceptors

/**
 * 1. Lấy signature từ Backend
 */
export const getCloudinarySignature = async (folder = 'oxalis_clone') => {
  const response = await axiosJWT.get(`/api/cloudinary/signature?folder=${folder}`);
  return response.data; 
  // response.data.data = { timestamp, signature, cloud_name, api_key, folder }
};

/**
 * 2. Upload file trực tiếp lên Cloudinary sử dụng chữ ký
 */
export const uploadFileToCloudinarySigned = async (file, folder = 'oxalis_clone') => {
  // B1: Lấy chữ ký từ server của mình
  const { data: authParams } = await getCloudinarySignature(folder);
  
  if (!authParams || !authParams.signature) {
    throw new Error('Không thể lấy chữ ký Cloudinary từ Server');
  }

  const { timestamp, signature, cloud_name, api_key } = authParams;

  // B2: Tạo form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  // B3: Đẩy thẳng lên Cloudinary
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
  const uploadResponse = await axios.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return uploadResponse.data; // Trả về toàn bộ dữ liệu (secure_url, public_id, v.v.)
};
