import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="title">Piki Ora Medical Centre</h1>
      <p className="subtitle">Your trusted healthcare appointment system</p>

      <div className="login-card">
        <h2>Welcome</h2>

        <button className="btn patient" onClick={() => navigate("/patient-login")}>
          Patient Login
        </button>

        <button className="btn register" onClick={() => navigate("/register")}>
          Patient Registration
        </button>

        <button className="btn admin" onClick={() => navigate("/admin-login")}>
          Admin Login
        </button>

        <p className="copyright">© 2026 Piki Ora Medical Centre</p>
      </div>
    </div>
  );
}
