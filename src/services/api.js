import axios from "axios";

const browserHost = typeof window === "undefined" ? "localhost" : window.location.hostname;
const API_URL = import.meta.env.VITE_API_URL || `http://${browserHost}:5000/api`;
let csrfToken = null;

export const setCsrfToken = (token) => {
  csrfToken = token || null;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const method = String(config.method || "get").toLowerCase();
  if (csrfToken && !["get", "head", "options"].includes(method)) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

export default api;
