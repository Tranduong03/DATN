import axios from 'axios';

// Hàm hỗ trợ parse hạn sử dụng JWT (exp) mà không cần thư viện bên ngoài
function getJwtExpiry(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null; // Đổi sang mili-giây
  } catch (e) {
    return null;
  }
}

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Add a request interceptor
axiosClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const exp = getJwtExpiry(token);
      const now = Date.now();
      const BUFFER_TIME = 5 * 60 * 1000; // 5 phút

      // Nếu token chưa hết hạn hoàn toàn nhưng sắp hết hạn (dưới BUFFER_TIME)
      if (
        exp &&
        exp - now < BUFFER_TIME &&
        exp - now > 0 &&
        !config.url?.includes('/auth/refresh-token') &&
        !config.url?.includes('/auth/login')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          // Gọi ngầm endpoint refresh-token
          axios
            .post('/api/auth/refresh-token', {}, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
              const newToken = res.data.token;
              if (newToken) {
                localStorage.setItem('token', newToken);
                onRefreshed(newToken);
              }
            })
            .catch((err) => {
              console.error('Không thể tự động refresh token:', err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        // Đợi cho đến khi token mới được cập nhật
        const retryOriginalRequest = new Promise<string>((resolve) => {
          subscribeTokenRefresh((newToken) => {
            resolve(newToken);
          });
        });

        const newToken = await retryOriginalRequest;
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }

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
  (error) => {
    // Xử lý khi lỗi 401 hoặc 403 (token hết hạn hẳn hoặc không hợp lệ)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
