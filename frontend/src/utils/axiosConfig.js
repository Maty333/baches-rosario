import axios from "axios";
import { API_URL } from "./constants.js";

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (!error.response) {
        if (error.message?.includes("CORS") || error.code === "ERR_NETWORK") {
          error.isCorsError = true;
          error.isNetworkError = true;
          return Promise.reject(error);
        }

        if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
          error.isNetworkError = true;
          return Promise.reject(error);
        }

        if (
          error.isNetworkError &&
          !originalRequest._retry &&
          originalRequest._retryCount < 3
        ) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

          const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));

          return instance(originalRequest);
        }
      }

      if (error.response) {
        if (error.response.status === 401) {
          // No limpiar automáticamente
        }

        if (error.response.status === 429) {
          error.isRateLimit = true;
        }

        if (error.response.status >= 500) {
          error.isServerError = true;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createAxiosInstance();

export const checkConnection = async () => {
  try {
    const healthUrl = API_URL.replace("/api", "") + "/api/health";
    const response = await fetch(healthUrl, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    try {
      const rootUrl = API_URL.replace("/api", "");
      const response = await fetch(rootUrl, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      return response.status < 500;
    } catch {
      return false;
    }
  }
};
