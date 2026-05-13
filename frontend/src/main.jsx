import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:8000/api/";

// 请求拦截器：自动附加 access token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：自动刷新 access token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // access token 过期
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("admin_refresh");

      try {
        // ⭐ 使用正确的 refresh API 路径
        const res = await axios.post("/auth/token/refresh/", { refresh });

        // 保存新的 access token
        localStorage.setItem("admin_access", res.data.access);

        // 重新发送原始请求
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return axios(originalRequest);

      } catch (refreshError) {
        console.log("Refresh token expired");
        localStorage.clear();
        window.location.href = "/admin-login";
      }
    }

    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
