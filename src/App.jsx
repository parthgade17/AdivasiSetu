import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Toast from './components/Toast';
import { useApp } from './context/AppContext';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EligibilityChecker = lazy(() => import('./pages/EligibilityChecker'));
const ScholarshipList = lazy(() => import('./pages/ScholarshipList'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker'));
const DocumentUpload = lazy(() => import('./pages/DocumentUpload'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AssistedMode = lazy(() => import('./pages/AssistedMode'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
import './index.css';

function RoleRoute({ roles, children }) {
  const { role } = useApp();
  return roles.includes(role) ? children : <Navigate to="/dashboard" replace />;
}

function Loading() {
  return <div role="status" aria-live="polite" style={{padding:40, textAlign:'center', color:'#68738F', fontFamily:'Inter, sans-serif'}}>Loading…</div>;
}

export default function App() {
  const { user, role } = useApp();
  const home = role === 'assistant' ? '/assisted' : '/dashboard';

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={home} replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={home} replace /> : <LoginPage />} />
        {user ? (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/eligibility" element={<EligibilityChecker />} />
            <Route path="/scholarships" element={<ScholarshipList />} />
            <Route path="/applications" element={<RoleRoute roles={['student', 'assistant']}><ApplicationTracker /></RoleRoute>} />
            <Route path="/documents" element={<RoleRoute roles={['student', 'assistant']}><DocumentUpload /></RoleRoute>} />
            <Route path="/notifications" element={<RoleRoute roles={['student', 'assistant']}><Notifications /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute roles={['student', 'assistant']}><Profile /></RoleRoute>} />
            <Route path="/assisted" element={<RoleRoute roles={['assistant']}><AssistedMode /></RoleRoute>} />
            <Route path="/admin" element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>} />
            <Route path="*" element={<Navigate to={home} replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
      </Suspense>
      <Toast />
    </BrowserRouter>
  );
}
