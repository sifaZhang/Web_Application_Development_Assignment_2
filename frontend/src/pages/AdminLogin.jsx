import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        username: username,
        password: password,
      });

      // 判断后端是否返回 token
      if (!response.data || !response.data.access) {
        alert("Admin login failed");
        return;
      }

      // 保存 token
      localStorage.setItem("admin_access", response.data.access);
      localStorage.setItem("admin_refresh", response.data.refresh);

      //alert("Admin login successful");

      // 跳转到 Admin Dashboard
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
      <div className="admin-card">
        <h2>Admin Login</h2>
        <p className="admin-subtitle">Access the management dashboard</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="admin-input"
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
          />

          <button type="submit" className="admin-btn">
            Login
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
