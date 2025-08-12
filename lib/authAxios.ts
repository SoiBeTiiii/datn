// lib/authAxios.ts
import axios from 'axios';

const authAxios = axios.create({
  // baseURL: 'http://api-gateway.egomall.io.vn/api/v1/auth/',
  baseURL: 'http://localhost:8000/api/v1/auth/',
  withCredentials: true, // <- cực kỳ quan trọng để gửi cookie
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Refresh token khi bị 401
// authAxios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Nếu lỗi 401 và chưa từng thử refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Gọi refresh (backend sẽ gửi lại cookie mới nếu hợp lệ)
//         await axios.post(
//           'http://localhost:8000/api/v1/auth/refresh',
//           {},
//           {
//             withCredentials: true,
//             headers: {
//               Accept: 'application/json',
//             },
//           }
//         );

//         // Sau khi refresh thành công, gửi lại request gốc
//         return authAxios(originalRequest);
//       } catch (refreshError) {
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default authAxios;
