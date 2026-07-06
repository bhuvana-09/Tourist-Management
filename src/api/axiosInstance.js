import axios from "axios";

const api = axios.create({
  // JSON Server is expected to run on port 3000
  baseURL: "http://localhost:3000",
});

export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
});

// Interceptor to automatically unwrap the consistent { success: true, data } response
backendApi.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;