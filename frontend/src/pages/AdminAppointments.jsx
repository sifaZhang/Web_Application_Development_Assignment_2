import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import "./AdminAppointments.css"; // you can reuse AdminDoctors.css if you want

export default function AdminAppointments() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Admin";

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [filters, setFilters] = useState({
        patient: "",
        doctor: "",
        date: "",
    });

    const token = localStorage.getItem("admin_access");

    // Load doctors for filter dropdown
    const loadDoctors = async () => {
        try {
            const res = await adminAxios.get("/admin/doctors/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(res.data);
        } catch (err) {
            alert("Failed to load doctors");
        }
    };

    // Load all appointments
    const loadAppointments = async () => {
        try {
            const res = await adminAxios.get("/appointments/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            alert("Failed to load appointments");
        }
    };

    useEffect(() => {
        loadDoctors();
        loadAppointments();
    }, []);

    // Delete appointment
    const deleteAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this appointment")) return;

        try {
            await adminAxios.delete(`/appointments/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            loadAppointments();
        } catch (err) {
            alert("Failed to delete appointment");
        }
    };

    // Filter logic
    const filtered = appointments.filter((a) => {
        const p = filters.patient.toLowerCase();
        const patientMatch = a.patient.username.toLowerCase().includes(p);

        const doctorMatch = filters.doctor
            ? a.slot.doctor.id === Number(filters.doctor)
            : true;

        const dateMatch = filters.date
            ? a.slot.date === filters.date
            : true;

        return patientMatch && doctorMatch && dateMatch;
    });

    return (
        <div className="admin-container">

            {/* HEADER */}
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

            <h2 className="dashboard-title">Patient Appointments</h2>

            <div className="doctor-page">

                {/* FILTER CARD */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Filter Appointments</h2>

                    <div className="doctor-form">
                        <input
                            type="text"
                            placeholder="Patient Username"
                            value={filters.patient}
                            onChange={(e) =>
                                setFilters({ ...filters, patient: e.target.value })
                            }
                        />

                        <select
                            className="appointment-doctor-select"
                            value={filters.doctor}
                            onChange={(e) =>
                                setFilters({ ...filters, doctor: e.target.value })
                            }
                        >
                            <option value="">All Doctors</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) =>
                                setFilters({ ...filters, date: e.target.value })
                            }
                        />

                        <button className="add-btn" onClick={loadAppointments}>
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* APPOINTMENT LIST */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Appointment List</h2>

                    {filtered.length === 0 ? (
                        <p className="empty-text">No appointments found.</p>
                    ) : (
                        <table className="doctor-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((a) => (
                                    <tr key={a.id}>
                                        <td>{a.patient.username}</td>
                                        <td>{a.slot.doctor.name}</td>
                                        <td>{a.slot.date}</td>
                                        <td>{a.slot.time.slice(0, 5)}</td>
                                        <td>{a.status}</td>
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteAppointment(a.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <footer className="admin-footer">
                    © 2026 Piki Ora Medical Centre
                </footer>
            </div>
        </div>
    );
}
