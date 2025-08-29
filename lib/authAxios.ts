// src/lib/authAxios.ts
import axios from 'axios';
// ADD
import { refreshToken as apiRefresh } from './authApi';
import { tokenRefresher } from './tokenRefresher';

const authAxios = axios.create({
  // baseURL: 'http://localhost:8000/api/v1/auth', 
  baseURL: 'https://api-gateway-egomall.io.vn/api/v1/auth',
  withCredentials: true,
});

// (GIỮ NGUYÊN) Request interceptor của bạn
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  console.log(config);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ADD — Response interceptor: fallback 401 → refresh 1 lần rồi retry
let isRefreshing = false as boolean;
let queue: Array<(t: string) => void> = [];

authAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err.config || {};
    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((newToken) => {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(authAxios(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const res = await apiRefresh();
        const newToken = (res as any)?.data?.token;
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          tokenRefresher.scheduleFromToken(newToken);
          queue.forEach((cb) => cb(newToken));
          queue = [];
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return authAxios(original);
        }
      } catch (e) {
        localStorage.removeItem('authToken');
        queue = [];
        // tuỳ ý: window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ADD — khởi động lịch nếu có token sẵn (khi file này được import)
try {
  tokenRefresher.initFromCurrentToken();
} catch {}

export default authAxios;
