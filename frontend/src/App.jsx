import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/PatientLogin";
import Register from "./pages/PatientRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDoctors from "./pages/AdminDoctors";
import PatientAccounts from "./pages/PatientAccounts";
import SlotManager from "./pages/SlotManager";
import AdminAppointments from "./pages/AdminAppointments";
import BookAppointment from "./pages/Booking";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patient-login" element={<Login />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/booking" element={<BookAppointment />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin/doctors" element={<AdminDoctors />} />
      <Route path="/admin/patients" element={<PatientAccounts />} />
      <Route path="/admin/slots" element={<SlotManager />} />
      <Route path="/admin/appointments" element={<AdminAppointments />} />
      <Route path="*" element={"Page not found"} />
    
    </Routes>
  );
}

export default App;
