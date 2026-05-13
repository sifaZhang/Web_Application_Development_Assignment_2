import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  return (
    <div className="admin-container">
      {/* 全宽 Header - 在 container 外面 */}
      <header className="admin-header">
        <h1><a href="/admin-dashboard">Admin Dashboard</a></h1>
        <div className="admin-user">
          <span>Logged in as: {username}</span>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/admin-login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* 页面内容居中 */}
      <div className="admin-dashboard-container">
        <h2 className="dashboard-title">Piki Ora Medical Centre</h2>

        <div className="card-grid">
          <div className="admin-card">
            <h3>Doctor Management</h3>
            <p>View, add, edit, or remove doctor profiles.</p>
            <button className="card-btn" onClick={() => navigate("/admin/doctors")}>
              Manage Doctors
            </button>
          </div>

          <div className="admin-card">
            <h3>Appointment Slots</h3>
            <p>Create and manage available appointment times.</p>
            <button className="card-btn" onClick={() => navigate("/admin/slots")}>
              Manage Slots
            </button>
          </div>

          <div className="admin-card">
            <h3>Patient Appointments</h3>
            <p>View, edit, or cancel patient bookings.</p>
            <button className="card-btn" onClick={() => navigate("/admin/appointments")}>
              Manage Appointments
            </button>
          </div>

          <div className="admin-card">
            <h3>Patient Accounts</h3>
            <p>View and manage registered patient accounts.</p>
            <button className="card-btn" onClick={() => navigate("/admin/patients")}>
              Manage Patients
            </button>
          </div>
        </div>

        <footer className="admin-footer">
          © 2026 Piki Ora Medical Centre
        </footer>
      </div>
    </div>
  );
}
