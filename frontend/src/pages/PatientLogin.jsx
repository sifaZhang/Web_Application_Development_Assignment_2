import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientLogin.css";

export default function PatientLogin() {
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

            if (!response.data || !response.data.access) {
                alert("Login failed");
                return;
            }

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            navigate("/patient-dashboard");

        } catch (error) {
            alert("Invalid username or password");
        }
    };

    return (
        <div className="patient-container">
            <div className="patient-login-card">
                <h2>Patient Login</h2>
                <p className="patient-subtitle">Access your appointments and records</p>

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
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="patient-input"
                    />

                    <button type="submit" className="patient-btn">
                        Login
                    </button>
                </form>

                <button className="patient-register-btn" onClick={() => navigate("/register")}>
                    Create a Patient Account
                </button>

                <button className="patient-back-btn" onClick={() => navigate("/")}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}
