import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (err: any) => void) {
  refreshSubscribers.push({ resolve, reject });
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((sub) => sub.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: any) {
  refreshSubscribers.forEach((sub) => sub.reject(error));
  refreshSubscribers = [];
}

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

      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('token');

      if (!refreshToken || !accessToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        axios
          .post('/api/auth/refresh', {
            accessToken,
            refreshToken,
          })
          .then((res) => {
            const newAccessToken = res.data.token || res.data.Token;
            const newRefreshToken = res.data.refreshToken || res.data.RefreshToken;
            if (newAccessToken && newRefreshToken) {
              localStorage.setItem('token', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              onRefreshed(newAccessToken);
            } else {
              throw new Error('Response body does not contain valid access or refresh tokens.');
            }
          })
          .catch((err) => {
            console.error('Không thể refresh token tự động:', err);
            onRefreshFailed(err);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      // Đợi refresh thành công rồi chạy lại request ban đầu
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          },
          (err) => {
            reject(err);
          }
        );
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
