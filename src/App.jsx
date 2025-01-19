import './App.css'
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import DoctorsList from "./pages/DoctorsList";
import BookDoctor from "./pages/BookDoctor.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import { AuthProvider } from "./components/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/bookDoctors" element={<BookDoctor />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
