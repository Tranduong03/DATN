import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
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

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      typeof window !== "undefined" &&
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/admin-login")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("adminRefreshToken");
      const accessToken = localStorage.getItem("adminToken");

      if (!refreshToken || !accessToken) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = "/auth/v1/login";
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        axios
          .post(`${apiClient.defaults.baseURL || "http://localhost:5001"}/api/auth/refresh`, {
            accessToken,
            refreshToken,
          })
          .then((res) => {
            const newAccessToken = res.data.token || res.data.Token;
            const newRefreshToken = res.data.refreshToken || res.data.RefreshToken;
            if (newAccessToken && newRefreshToken) {
              localStorage.setItem("adminToken", newAccessToken);
              localStorage.setItem("adminRefreshToken", newRefreshToken);
              onRefreshed(newAccessToken);
            }
          })
          .catch((err) => {
            console.error("Không thể refresh admin token tự động:", err);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminRefreshToken");
            window.location.href = "/auth/v1/login";
          })
          .finally(() => {
            isRefreshing = false;
          });
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
