import axios from "axios";

// Backend Express routes are mounted at the root (/auth, /admin, /variants,
// /products, /validate, /stats) on port 3000. There is no /api/v1 prefix.
//
// In dev we use a relative baseURL and let the Vite proxy (vite.config.js)
// forward these paths to http://localhost:3000, keeping requests same-origin
// (no CORS needed).
const API = axios.create({
  baseURL: "",
});

API.interceptors.request.use((config) => {
  // The login endpoint returns the JWT WITHOUT the "Bearer " prefix once
  // normalized in authService, so we always prepend it here.
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
