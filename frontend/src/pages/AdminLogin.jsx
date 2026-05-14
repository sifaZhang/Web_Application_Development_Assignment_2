import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await adminAxios.post("/auth/login/", {
        username: username,
        password: password,
      });

      // 判断是否管理员
      if (!response.data.is_staff) {
        alert("You are not an admin");
        return;
      }

      // 保存 token
      localStorage.setItem("admin_access", response.data.access);
      localStorage.setItem("admin_refresh", response.data.refresh);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("is_staff", response.data.is_staff);

      navigate("/admin-dashboard");

    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.detail || "Invalid admin credentials");
      } else {
        alert("Network error");
      }
    }
  };


  return (
    <div className="admin-container">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <p className="admin-login-subtitle">Access the management dashboard</p>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-login-input"
            />

            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input"
            />

            <button type="submit" className="admin-login-btn">
              Login
            </button>
          </form>

          <button className="admin-login-back-btn" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
