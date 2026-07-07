import axios from "axios";

const api = axios.create({
  // JSON Server is expected to run on port 3000
  baseURL: "http://localhost:3000",
});

// Dynamic Instance-Switching Interceptors for Packages & Itineraries
api.interceptors.request.use(
  (config) => {
    if (config.url && (
      config.url.startsWith("/packages") || 
      config.url.startsWith("/itineraries") || 
      config.url.startsWith("/destinations") ||
      config.url.startsWith("/bookings") ||
      config.url.startsWith("/coupons") ||
      config.url.startsWith("/payments") ||
      config.url.startsWith("/ai") ||
      config.url.startsWith("/users") ||
      config.url.startsWith("/notifications") ||
      config.url.startsWith("/analytics") ||
      config.url.startsWith("/export")
    )) {
      config.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
      config.withCredentials = true;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const url = response.config.url || "";
    if (
      url.includes("/packages") || 
      url.includes("/itineraries") || 
      url.includes("/destinations") ||
      url.includes("/bookings") ||
      url.includes("/coupons") ||
      url.includes("/payments") ||
      url.includes("/ai") ||
      url.includes("/users") ||
      url.includes("/notifications") ||
      url.includes("/analytics") ||
      url.includes("/export")
    ) {
      if (response.data && response.data.success === true && response.data.data !== undefined) {
        if (response.data.meta !== undefined) {
          response.data = { data: response.data.data, meta: response.data.meta };
        } else {
          response.data = response.data.data;
        }
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let token = null;

export const setAuthToken = (newToken) => {
  token = newToken;
};

// Request Interceptor: Attach bearer access token to requests
backendApi.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: unwrap { success: true, data } and automatically refresh token on 401
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

backendApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      if (response.data.meta !== undefined) {
        response.data = { data: response.data.data, meta: response.data.meta };
      } else {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and it's not a retry already
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if refreshing endpoint itself returns 401
      if (originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(backendApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api") + "/auth/refresh",
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.data.accessToken;
        
        setAuthToken(newAccessToken);
        onRefreshed(newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return backendApi(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        setAuthToken(null);
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;