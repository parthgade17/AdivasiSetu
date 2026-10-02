import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EligibilityChecker from './pages/EligibilityChecker';
import ScholarshipList from './pages/ScholarshipList';
import ApplicationTracker from './pages/ApplicationTracker';
import DocumentUpload from './pages/DocumentUpload';
import AdminDashboard from './pages/AdminDashboard';
import AssistedMode from './pages/AssistedMode';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student'); // student | admin | assistant

  const handleLogin = (role = 'student') => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage onLogin={handleLogin} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        {isLoggedIn ? (
          <Route element={<Layout onLogout={handleLogout} userRole={userRole} />}>
            <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
            <Route path="/eligibility" element={<EligibilityChecker />} />
            <Route path="/scholarships" element={<ScholarshipList />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            <Route path="/documents" element={<DocumentUpload />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assisted" element={<AssistedMode />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
