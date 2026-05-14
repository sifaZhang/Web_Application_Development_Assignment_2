import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import "./PatientAccounts.css";

export default function PatientAccounts() {
    const [patients, setPatients] = useState([]);
    const [editingPatient, setEditingPatient] = useState(null);
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Admin";

    const fetchPatients = async () => {
        try {
            const response = await adminAxios.get("/patients/");
            setPatients(response.data);
        } catch (error) {
            console.log("Error fetching patients:", error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this patient account")) return;

        try {
            await adminAxios.delete(`/patients/${id}/`);
            fetchPatients();
        } catch (error) {
            console.log("Error deleting patient:", error);
            alert("Only admin can delete patient accounts");
        }
    };

    // 打开编辑弹窗
    const openEditModal = (p) => {
        setEditingPatient({
            ...p,
            user: { ...p.user },
        });
    };

    // 保存编辑（完全匹配你的后端 nested serializer）
    const handleSaveEdit = async () => {
        try {
            await adminAxios.put(`/patients/${editingPatient.id}/`, {
                phone: editingPatient.phone,
                gender: editingPatient.gender,
                birthday: editingPatient.birthday,
                user: {
                    first_name: editingPatient.user.first_name,
                    last_name: editingPatient.user.last_name,
                    email: editingPatient.user.email,
                },
            });

            //alert("Patient updated!");
            setEditingPatient(null);
            fetchPatients();
        } catch (error) {
            console.log("Error updating patient:", error.response?.data);
            alert("Update failed");
        }
    };

    return (
        <div className="admin-container">
            {/* 顶部导航条 */}
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

            {/* 页面主体 */}
            <h2 className="dashboard-title">Patient Accounts Management</h2>
            <div className="patient-page">
                <div className="patient-account-card">
                    <h2 className="patient-subtitle">Registered Patients</h2>

                    {patients.length === 0 ? (
                        <p className="empty-text">No patient accounts found.</p>
                    ) : (
                        <table className="patient-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Firstname</th>
                                    <th>Lastname</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Gender</th>
                                    <th>Birthday</th>
                                    <th>Registered at</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {patients.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.user?.username}</td>
                                        <td>{p.user?.first_name}</td>
                                        <td>{p.user?.last_name}</td>
                                        <td>{p.user?.email}</td>
                                        <td>{p.phone}</td>
                                        <td>{p.gender}</td>
                                        <td>{p.birthday}</td>
                                        <td>
                                            {p.user?.date_joined
                                                ? new Date(p.user.date_joined)
                                                    .toISOString()
                                                    .slice(0, 16)
                                                    .replace("T", " ")
                                                : ""}
                                        </td>

                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() => openEditModal(p)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(p.id)}
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

            {/* 编辑弹窗 */}
            {editingPatient && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit Patient</h2>

                        <div className="modal-field">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={editingPatient.user.first_name}
                                onChange={(e) =>
                                    setEditingPatient({
                                        ...editingPatient,
                                        user: { ...editingPatient.user, first_name: e.target.value },
                                    })
                                }
                            />
                        </div>

                        <div className="modal-field">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={editingPatient.user.last_name}
                                onChange={(e) =>
                                    setEditingPatient({
                                        ...editingPatient,
                                        user: { ...editingPatient.user, last_name: e.target.value },
                                    })
                                }
                            />
                        </div>

                        <div className="modal-field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={editingPatient.user.email}
                                onChange={(e) =>
                                    setEditingPatient({
                                        ...editingPatient,
                                        user: { ...editingPatient.user, email: e.target.value },
                                    })
                                }
                            />
                        </div>

                        <div className="modal-field">
                            <label>Phone</label>
                            <input
                                type="text"
                                value={editingPatient.phone}
                                onChange={(e) =>
                                    setEditingPatient({ ...editingPatient, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className="modal-field">
                            <label>Gender</label>
                            <select
                                value={editingPatient.gender}
                                onChange={(e) =>
                                    setEditingPatient({ ...editingPatient, gender: e.target.value })
                                }
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="modal-field">
                            <label>Birthday</label>
                            <input
                                type="date"
                                value={editingPatient.birthday}
                                onChange={(e) =>
                                    setEditingPatient({
                                        ...editingPatient,
                                        birthday: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleSaveEdit}>
                                Save
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setEditingPatient(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
