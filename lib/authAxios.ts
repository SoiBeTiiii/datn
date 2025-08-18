import axios from 'axios';

const authAxios = axios.create({
  baseURL: 'http://localhost:8000/api/v1/auth', // Đảm bảo là đúng URL của backend
  withCredentials: true, // Cho phép gửi cookie (nếu cần)
});

// Dùng Optional Chaining để tránh lỗi khi headers là undefined
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Hoặc từ sessionStorage, tùy vào cách bạn lưu token
  if (token && config.headers) { // Kiểm tra xem config.headers có tồn tại không
    config.headers['Authorization'] = `Bearer ${token}`; // Gửi token trong header
  }
  console.log(config); // Kiểm tra header trong request

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default authAxios;
