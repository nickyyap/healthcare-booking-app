import './App.css'
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import DoctorsList from "./pages/DoctorsList";
import BookDoctor from "./pages/BookDoctor.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import DoctorAppointments from "./pages/DoctorAppointments.jsx";
import Report from "./pages/Report.jsx";
import DoctorHomePage from "./pages/DoctorHomePage.jsx";
import { AuthProvider } from "./components/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/doctorHome" element={<DoctorHomePage />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/bookDoctors" element={<BookDoctor />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/doctorAppointments" element={<DoctorAppointments />} />
          <Route path="/report" element={<Report />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
