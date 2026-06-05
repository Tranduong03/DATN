import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        window.location.href = "/auth/v1/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
