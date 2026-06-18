// src/services/axiosInstance.js
// PURPOSE: One configured Axios instance for the whole app.
// Reads the base URL from .env so you never hardcode it.

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // ↑ Reads from .env automatically
  // import.meta.env is how Vite exposes env variables to React

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
  // ↑ Fail after 10 seconds if no response
});

// REQUEST INTERCEPTOR
// Runs before every single API call
axiosInstance.interceptors.request.use(
  (config) => {
    // Later: attach JWT token here
    // const token = localStorage.getItem("token")
    // if (token) config.headers.Authorization = `Bearer ${token}`
    console.log(`→ ${config.method.toUpperCase()} ${config.url}`);
    // ↑ Logs every request in dev — remove in production
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Runs after every response comes back
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.detail || error.message;

    if (status === 404) console.warn("404 Not Found:", error.config?.url);
    if (status === 422) console.warn("422 Validation Error:", message);
    if (status === 500) console.error("500 Server Error:", message);

    return Promise.reject(error);
  }
);

export default axiosInstance;