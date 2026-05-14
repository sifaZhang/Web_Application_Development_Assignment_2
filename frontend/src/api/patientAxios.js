import axios from "axios";

const patientAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/",
});

// 请求拦截器
patientAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access"); // patient token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 刷新 token
patientAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem("refresh");
      const res = await patientAxios.post("/auth/token/refresh/", { refresh });

      localStorage.setItem("access", res.data.access);
      original.headers.Authorization = `Bearer ${res.data.access}`;
      return patientAxios(original);
    }

    return Promise.reject(error);
  }
);

export default patientAxios;
