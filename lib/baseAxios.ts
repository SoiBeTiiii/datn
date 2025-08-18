import axios from 'axios';

const baseAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API, // Ví dụ: http://127.0.0.1:8000/api/v1/front
  withCredentials: true, // ✅ Gửi cookie đính kèm request
});

// Interceptor cho request để thêm token vào header
baseAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
    if (token && config.headers) { // Kiểm tra nếu config.headers tồn tại
      config.headers['Authorization'] = `Bearer ${token}`; // Thêm token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default baseAxios;
