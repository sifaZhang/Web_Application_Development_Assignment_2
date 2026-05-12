import api from "./api";

export async function login(email, password) {
  const response = await api.post("token/", {
    email,
    password,
  });

  localStorage.setItem("access", response.data.access);
  return response.data;
}
