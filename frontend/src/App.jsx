import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/PatientLogin";
import Register from "./pages/PatientRegister";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/patient-login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
    </Routes>
  );
}

export default App;
