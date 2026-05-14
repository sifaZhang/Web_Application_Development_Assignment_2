import { useState } from "react";
import { useNavigate } from "react-router-dom";
import patientAxios from "../api/patientAxios";
import "./PatientLogin.css";

export default function PatientLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await patientAxios.post("/auth/login/", {
                username,
                password,
            });

            if (!response.data || !response.data.access) {
                alert("Login failed");
                return;
            }

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("user_id", response.data.id);
            localStorage.setItem("username", response.data.username);

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
