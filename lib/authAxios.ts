import axios from 'axios';

// Tạo instance axios cho các request liên quan đến xác thực
const authAxios = axios.create({
  baseURL: 'https://api-gateway-egomall.io.vn/api/v1/auth/', // Đổi thành domain thật nếu cần
  withCredentials: true, // 🔥 Bắt buộc để gửi cookie (access & refresh token)
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động refresh token khi gặp lỗi 401
  // authAxios.interceptors.response.use(
  //   (response) => response,
  //   async (error) => {
  //     const originalRequest = error.config;

  //     // Nếu lỗi là 401 và chưa retry
  //     if (
  //       error.response?.status === 401 &&
  //       !originalRequest._retry
  //     ) {
  //       originalRequest._retry = true;

  //       try {
  //         // Gọi API refresh token (cookie sẽ tự được gửi)
  //         await authAxios.post('refresh');

  //         // Thử lại request gốc
  //         return authAxios(originalRequest);
  //       } catch (refreshError) {
  //         console.error('❌ Refresh token thất bại:', refreshError);

  //         // Tuỳ bạn: có thể logout, redirect, hoặc hiển thị thông báo
  //         // Ví dụ: window.location.href = '/login';
  //       }
  //     }

  //     return Promise.reject(error);
  //   }
  // );

export default authAxios;
