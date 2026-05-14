import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import patientAxios from "../api/patientAxios";
import "./PatientDashboard.css";

export default function PatientDashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access");
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");

    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);

    // 获取 profile
    const loadProfile = async () => {
        try {
            const res = await patientAxios.get(`/patients/by_user/${userId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (err) {
            console.log("Failed to load profile");
        }
    };

    // 获取预约
    const loadAppointments = async () => {
        try {
            const res = await patientAxios.get("/appointments/my/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.log("Failed to load appointments");
        }
    };

    useEffect(() => {
        loadProfile();
        loadAppointments();
    }, []);

    // 判断是否为过去预约
    const isPast = (dateStr) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const apptDate = new Date(dateStr);
        apptDate.setHours(0, 0, 0, 0);

        return apptDate <= today;
    };

    // 取消预约
    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment")) return;

        try {
            await patientAxios.post(`/appointments/${id}/cancel/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            loadAppointments();
        } catch (err) {
            alert("Failed to cancel appointment");
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

            <h2 className="dashboard-title">Welcome back, {username}</h2>

            <div className="doctor-page">

                {/* PROFILE */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Your Profile</h2>

                    {profile ? (
                        <div className="profile-grid">
                            <div>
                                <p><strong>First Name:</strong> {profile.user.first_name}</p>
                                <p><strong>Last Name:</strong> {profile.user.last_name}</p>
                                <p><strong>Email:</strong> {profile.user.email}</p>
                                <p><strong>Username:</strong> {profile.user.username}</p>
                            </div>

                            <div>
                                <p><strong>Phone:</strong> {profile.phone}</p>
                                <p><strong>Gender:</strong> {profile.gender}</p>
                                <p><strong>Birthday:</strong> {profile.birthday}</p>
                                <p><strong>Registered at:</strong> {profile.user.date_joined.slice(0, 16).replace("T", " ")}</p>
                            </div>
                        </div>

                    ) : (
                        <p className="empty-text">Loading profile...</p>
                    )}
                </div>

                {/* APPOINTMENTS */}
                <div className="doctor-card">
                    <div className="appointment-header">
                        <h2 className="doctor-subtitle">Your Appointments</h2>

                        <button
                            className="edit-btn small-btn"
                            onClick={() => navigate("/booking")}
                        >
                            Book Appointment
                        </button>
                    </div>


                    {appointments.length === 0 ? (
                        <p className="empty-text">You have no appointments.</p>
                    ) : (
                        <table className="doctor-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Booked At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {appointments.map((a) => (
                                    <tr key={a.id}>
                                        <td>{a.slot.doctor.name}</td>
                                        <td>{a.slot.date}</td>
                                        <td>{a.slot.time.slice(0, 5)}</td>
                                        <td>{a.created_at.slice(0, 16).replace("T", " ")}</td>

                                        <td>
                                            {/* 已取消 */}
                                            {a.status === "cancelled" && (
                                                <span style={{ color: "#b71c1c", fontWeight: "600" }}>
                                                    Cancelled
                                                </span>
                                            )}

                                            {/* 过去预约不能取消 */}
                                            {a.status === "booked" && isPast(a.slot.date) && (
                                                <span style={{ color: "#777" }}>
                                                    Not allowed
                                                </span>
                                            )}

                                            {/* 未来预约可取消 */}
                                            {a.status === "booked" && !isPast(a.slot.date) && (
                                                <>
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => navigate(`/booking?edit=${a.id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => cancelAppointment(a.id)}
                                                    >
                                                        Cancle
                                                    </button>
                                                </>
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
        </div>
    );
}
