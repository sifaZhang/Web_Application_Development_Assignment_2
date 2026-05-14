import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "/api/";

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

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("admin_refresh");

      try {
        const res = await axios.post("/auth/token/refresh/", { refresh });

        localStorage.setItem("admin_access", res.data.access);

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

export default axios;
