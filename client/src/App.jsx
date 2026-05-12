import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Home from "./pages/Home.jsx";
import DonorMap from "./pages/DonorMap.jsx";
import Requests from "./pages/Requests.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import DonorDashboard from "./pages/DonorDashboard.jsx";
import HospitalDashboard from "./pages/HospitalDashboard.jsx";
import EmergencyRequest from "./pages/EmergencyRequest.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import DonorProfile from "./pages/DonorProfile.jsx";
import RequestBlood from "./pages/RequestBlood.jsx";
import DonorAlerts from "./pages/DonorAlerts.jsx";

function DL({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Shared authenticated pages - Hospital and Admin only */}
      <Route path="/map" element={
        <ProtectedRoute allowedRoles={['hospital','admin']}>
          <DL><DonorMap /></DL>
        </ProtectedRoute>
      } />

      <Route path="/requests" element={
        <ProtectedRoute allowedRoles={['donor','hospital','admin']}>
          <DL><Requests /></DL>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <DL><Profile /></DL>
        </ProtectedRoute>
      } />

      {/* Donor routes */}
      <Route path="/donor/dashboard" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DL><DonorDashboard /></DL>
        </ProtectedRoute>
      } />

      <Route path="/donor/profile" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DL><DonorProfile /></DL>
        </ProtectedRoute>
      } />

      <Route path="/donor/alerts" element={
        <ProtectedRoute allowedRoles={['donor', 'hospital', 'admin']}>
          <DL><DonorAlerts /></DL>
        </ProtectedRoute>
      } />

      {/* Hospital routes */}
      <Route path="/hospital/dashboard" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <DL><HospitalDashboard /></DL>
        </ProtectedRoute>
      } />

      <Route path="/hospital/emergency-request" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <DL><EmergencyRequest /></DL>
        </ProtectedRoute>
      } />

      <Route path="/hospital/request" element={
        <ProtectedRoute allowedRoles={['hospital']}>
          <DL><EmergencyRequest /></DL>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DL><AdminDashboard /></DL>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
