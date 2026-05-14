import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import "./AdminDoctors.css";

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [form, setForm] = useState({
        name: "",
        specialty: "",
        phone: "",
        email: "",
        description: "",
    });

    const [editingDoctor, setEditingDoctor] = useState(null); // 当前正在编辑的医生

    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Admin";

    const fetchDoctors = async () => {
        try {
            const response = await adminAxios.get("/manage/doctors/");
            setDoctors(response.data);
        } catch (error) {
            console.log("Error fetching doctors:", error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleAddDoctor = async (e) => {
        e.preventDefault();

        try {
            await adminAxios.post("/manage/doctors/", form);

            alert("Doctor added!");

            setForm({
                name: "",
                specialty: "",
                phone: "",
                email: "",
                description: "",
            });

            fetchDoctors();
        } catch (error) {
            console.log("Error adding doctor:", error);
            alert("Only admin can add doctors");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor")) return;

        try {
            await adminAxios.delete(`/manage/doctors/${id}/`);
            fetchDoctors();
        } catch (error) {
            console.log("Error deleting doctor:", error);
            alert("Only admin can delete doctors");
        }
    };

    // 打开编辑弹窗
    const openEditModal = (doc) => {
        setEditingDoctor(doc);
    };

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            await adminAxios.put(`/manage/doctors/${editingDoctor.id}/`, editingDoctor);
            //alert("Doctor updated!");
            setEditingDoctor(null);
            fetchDoctors();
        } catch (error) {
            console.log("Error updating doctor:", error);
            alert("Only admin can edit doctors");
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
            <h2 className="dashboard-title">Doctors Management</h2>
            <div className="doctor-page">

                {/* 添加医生卡片 */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Add New Doctor</h2>

                    <form className="doctor-form" onSubmit={handleAddDoctor}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Specialty"
                            value={form.specialty}
                            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />

                        <button type="submit" className="add-btn">Add Doctor</button>
                    </form>
                </div>

                {/* 医生列表卡片 */}
                <div className="doctor-card">
                    <h2 className="doctor-subtitle">Doctor List</h2>

                    {doctors.length === 0 ? (
                        <p className="empty-text">No doctors found.</p>
                    ) : (
                        <table className="doctor-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Specialty</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {doctors.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.name}</td>
                                        <td>{doc.specialty}</td>
                                        <td>{doc.phone}</td>
                                        <td>{doc.email}</td>
                                        <td>{doc.description}</td>
                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() => openEditModal(doc)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(doc.id)}
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
            {editingDoctor && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit Doctor</h2>

                        <input
                            type="text"
                            value={editingDoctor.name}
                            onChange={(e) =>
                                setEditingDoctor({ ...editingDoctor, name: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            value={editingDoctor.specialty}
                            onChange={(e) =>
                                setEditingDoctor({ ...editingDoctor, specialty: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            value={editingDoctor.phone}
                            onChange={(e) =>
                                setEditingDoctor({ ...editingDoctor, phone: e.target.value })
                            }
                        />

                        <input
                            type="email"
                            value={editingDoctor.email}
                            onChange={(e) =>
                                setEditingDoctor({ ...editingDoctor, email: e.target.value })
                            }
                        />

                        <textarea
                            value={editingDoctor.description}
                            onChange={(e) =>
                                setEditingDoctor({
                                    ...editingDoctor,
                                    description: e.target.value,
                                })
                            }
                        />

                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleSaveEdit}>
                                Save
                            </button>
                            <button className="cancel-btn" onClick={() => setEditingDoctor(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
