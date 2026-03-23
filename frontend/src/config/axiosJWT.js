import axios from "axios";
import { axiosPublic } from "./axiosPublic";
import { setAccessToken, clearToken } from "../redux/slices/tokenSlice";
import { logout } from "../redux/slices/authSlice";

const baseURL = "http://localhost:9999";

export const axiosJWT = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

export const setupJwtInterceptors = (store) => {
  // Request Interceptor - Thêm accessToken vào header
  axiosJWT.interceptors.request.use((config) => {
    const state = store.getState();
    const accessToken = state?.token?.accessToken; // Lấy từ tokenSlice
    if (accessToken) {
      config.headers = config.headers || {};
      if (config.headers.set) {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  });

  // Response Interceptor - Xử lý refresh token khi 401
  axiosJWT.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then((token) => {
            if (originalRequest.headers && originalRequest.headers.set) {
              originalRequest.headers.set("Authorization", `Bearer ${token}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosJWT(originalRequest);
          });
        }

        isRefreshing = true;
        try {
          const res = await axiosPublic.post("/api/auth/refresh-token");
          const accessToken = res.data?.accessToken ?? null;

          if (accessToken) {
            store.dispatch(setAccessToken(accessToken));
            processQueue(null, accessToken);

            if (originalRequest.headers && originalRequest.headers.set) {
              originalRequest.headers.set(
                "Authorization",
                `Bearer ${accessToken}`,
              );
            } else {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return axiosJWT(originalRequest);
          } else {
            throw new Error("No access token received");
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          store.dispatch(logout());
          store.dispatch(clearToken());
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};
