import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import "./AdminAppointments.css";

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

    const [editingId, setEditingId] = useState(null);
    const [editDoctor, setEditDoctor] = useState("");
    const [editDate, setEditDate] = useState("");
    const [editSlots, setEditSlots] = useState([]);
    const [loadingEditSlots, setLoadingEditSlots] = useState(false);

    const token = localStorage.getItem("admin_access");

    const loadDoctors = async () => {
        try {
            const res = await adminAxios.get("/manage/doctors/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(res.data);
        } catch (err) {
            alert("Failed to load doctors");
        }
    };

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

    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await adminAxios.post(`/appointments/${id}/cancel/`);
            loadAppointments();
        } catch (err) {
            alert("Failed to cancel appointment");
        }
    };

    const loadEditSlots = async () => {
        if (!editDoctor || !editDate) {
            alert("Please select doctor and date");
            return;
        }
        setLoadingEditSlots(true);
        try {
            const res = await adminAxios.get(`/slots/?doctor=${editDoctor}&date=${editDate}`);
            setEditSlots(res.data.filter(s => !s.is_booked));
        } catch (err) {
            alert("Failed to load slots");
        }
        setLoadingEditSlots(false);
    };

    const updateAppointment = async (slotId) => {
        if (!window.confirm("Confirm reschedule?")) return;
        try {
            await adminAxios.patch(`/appointments/${editingId}/`, { slot_id: slotId });
            alert("Appointment updated!");
            setEditingId(null);
            setEditDoctor("");
            setEditDate("");
            setEditSlots([]);
            loadAppointments();
        } catch (err) {
            alert("Failed to update appointment");
        }
    };

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

                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Filter Appointments</h2>
                    <div className="doctor-form">
                        <input
                            type="text"
                            placeholder="Patient Username"
                            value={filters.patient}
                            onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
                        />
                        <select
                            className="appointment-doctor-select"
                            value={filters.doctor}
                            onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                        >
                            <option value="">All Doctors</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                        <button className="add-btn" onClick={loadAppointments}>
                            Apply Filters
                        </button>
                    </div>
                </div>

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
                                            {a.status !== "cancelled" && (
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => {
                                                        setEditingId(a.id);
                                                        setEditDoctor("");
                                                        setEditDate("");
                                                        setEditSlots([]);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {a.status !== "cancelled" && (
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => cancelAppointment(a.id)}
                                                >
                                                    Cancle
                                                </button>
                                            )}
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

            {editingId && (
                <div className="modal-overlay-appointment-doctor" onClick={() => setEditingId(null)}>
                    <div className="modal-box-appointment-doctor" onClick={(e) => e.stopPropagation()}>
                        <h3>Reschedule Appointment</h3>

                        <select
                            className="slot-input"
                            value={editDoctor}
                            onChange={(e) => setEditDoctor(e.target.value)}
                        >
                            <option value="">-- Select Doctor --</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            className="slot-input"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                        />

                        <button className="edit-btn" onClick={loadEditSlots}>
                            Show Available Slots
                        </button>

                        {loadingEditSlots && <p>Loading...</p>}

                        <div className="slot-grid">
                            {editSlots.map((s) => (
                                <button
                                    key={s.id}
                                    className="slot-button"
                                    onClick={() => updateAppointment(s.id)}
                                >
                                    {s.time.slice(0, 5)}
                                </button>
                            ))}
                        </div>

                        <button className="delete-btn" onClick={() => setEditingId(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}