import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        alert("Admin login clicked");
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
                        className="patient-input"
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
        </div >
    );
}
