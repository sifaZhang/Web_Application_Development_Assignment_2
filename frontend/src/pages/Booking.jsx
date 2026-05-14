import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import patientAxios from "../api/patientAxios";
import "./PatientDashboard.css";

export default function BookAppointment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit"); 
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username");

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // 获取医生列表
    const loadDoctors = async () => {
        try {
            const res = await patientAxios.get("/doctors/");
            setDoctors(res.data);
        } catch (err) {
            console.log("Failed to load doctors");
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    // 显示可用 slot
    const showSlots = async () => {
        if (!selectedDoctor || !selectedDate) {
            alert("Please select doctor and date");
            return;
        }

        setLoadingSlots(true);

        try {
            const res = await patientAxios.get(
                `/slots/?doctor=${selectedDoctor}&date=${selectedDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const available = res.data.filter(slot => slot.is_booked === false);
            setSlots(available);
        } catch (err) {
            console.log("Failed to load slots");
        }

        setLoadingSlots(false);
    };

    // 预约 slot
    const bookSlot = async (slotId) => {
        const msg = editId ? "Confirm reschedule?" : "Confirm booking?";
        if (!window.confirm(msg)) return;

        try {
            if (editId) {
                // 编辑模式：更新预约
                await patientAxios.patch(
                    `/appointments/${editId}/`,
                    { slot_id: slotId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Appointment updated!");
            } else {
                // 新建模式
                await patientAxios.post(
                    "/appointments/",
                    { slot_id: slotId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Appointment booked!");
            }
            navigate("/patient-dashboard");
        } catch (err) {
            alert("Failed");
        }
    };

    return (
        <div className="admin-container">

            {/* HEADER */}
            <header className="admin-header">
                <h1><a href="/patient-dashboard">Patient Dashboard</a></h1>

                <div className="admin-user">
                    <span>Logged in as: {username}</span>
                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/patient-login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <h2 className="dashboard-title">Book a New Appointment</h2>

            <div className="doctor-page">

                {/* 选择医生 + 日期 */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Select Doctor & Date</h2>

                    <div className="slot-form">
                        <label className="slot-label">Doctor</label>
                        <select
                            className="slot-input"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                        >
                            <option value="">-- Choose a doctor --</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <label className="slot-label">Date</label>
                        <input
                            type="date"
                            className="slot-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />

                        <button className="edit-btn slot-btn" onClick={showSlots}>
                            Show Available Slots
                        </button>
                    </div>
                </div>

                {/* 显示可用 slot */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Available Slots</h2>

                    {loadingSlots && <p className="empty-text">Loading slots...</p>}

                    {!loadingSlots && slots.length === 0 && (
                        <p className="empty-text">No available slots.</p>
                    )}

                    {!loadingSlots && slots.length > 0 && (
                        <div className="slot-grid">
                            {slots.map((slot) => (
                                <button
                                    key={slot.id}
                                    className="slot-button"
                                    onClick={() => bookSlot(slot.id)}
                                >
                                    {slot.time.slice(0, 5)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="admin-footer">
                    © 2026 Piki Ora Medical Centre
                </footer>
            </div>
        </div>
    );
}
