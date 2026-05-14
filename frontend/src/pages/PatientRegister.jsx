import { useState } from "react";
import { useNavigate } from "react-router-dom";
import patientAxios from "../api/patientAxios";
import "./PatientRegister.css";

export default function PatientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await patientAxios.post("/auth/register/", {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        birthday: form.birthday,
        gender: form.gender,
        password: form.password,
      });

      // 判断成功
      if (response.status === 201) {
        alert("Account created successfully!");
        navigate("/patient-login");
      }

    } catch (error) {

      // 判断失败
      if (error.response) {
        // 后端返回错误信息
        alert(error.response.data.error || "Registration failed");
      } else {
        // 网络错误
        alert("Network error");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Patient Registration</h2>
        <p className="register-subtitle">Create your patient account</p>

        <form onSubmit={handleRegister}>

          <div className="field">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="register-input"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <div className="field">
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={handleChange}
              className="register-input"
            />
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <button className="login-btn" onClick={() => navigate("/patient-login")}>
          Already have an account? Login
        </button>

        <button className="register-back-btn" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
