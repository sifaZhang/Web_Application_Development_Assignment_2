import { useEffect, useState } from "react";
import axios from "axios";
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

  // 获取医生列表
  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/admin/doctors/");
      setDoctors(response.data);
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // 添加医生
  const handleAddDoctor = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/admin/doctors/", form);

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

  // 删除医生
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor")) return;

    try {
      await axios.delete(`/admin/doctors/${id}/`);
      fetchDoctors();
    } catch (error) {
      console.log("Error deleting doctor:", error);
      alert("Only admin can delete doctors");
    }
  };

  return (
    <div className="doctor-container">
      <h1>Doctor Management</h1>

      {/* 添加医生表单 */}
      <div className="doctor-form">
        <h2>Add New Doctor</h2>

        <form onSubmit={handleAddDoctor}>
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

          <button type="submit">Add Doctor</button>
        </form>
      </div>

      {/* 医生列表（表格） */}
      <div className="doctor-list">
        <h2>Doctor List</h2>

        {doctors.length === 0 ? (
          <p>No doctors found.</p>
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
    </div>
  );
}
