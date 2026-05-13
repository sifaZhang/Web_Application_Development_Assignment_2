import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/PatientLogin";
import Register from "./pages/PatientRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDoctors from "./pages/AdminDoctors";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patient-login" element={<Login />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/doctors" element={<AdminDoctors />} />

    </Routes>
  );
}

export default App;
