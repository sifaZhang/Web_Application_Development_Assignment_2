import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientLogin.css";

export default function PatientLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        alert("Patient login clicked");
    };

    return (
        <div className="patient-container">
            <div className="patient-card">
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

                <button className="register-btn" onClick={() => navigate("/register")}>
                    Create a Patient Account
                </button>

                <button className="back-btn" onClick={() => navigate("/")}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
}
