import axios from 'axios';
import { refreshAccessToken } from '../utils/auth';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const isRetry = originalRequest._retry || originalRequest.headers?.['X-Retry'] === 'true';

    // Tránh vòng lặp vô tận nếu api refresh hoặc login trả về 401/403
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !isRetry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      if (originalRequest.headers) {
        originalRequest.headers['X-Retry'] = 'true';
      }

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (err) {
        console.error('Không thể refresh token tự động hoặc gửi lại request:', err);
      }

      // Nếu refresh token thất bại hoặc không tồn tại token, chuyển hướng về trang login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

