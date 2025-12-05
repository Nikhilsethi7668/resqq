import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreateNews from './pages/CreateNews';
import ManageAdmins from './pages/ManageAdmins';
import NewsAdminDashboard from './pages/NewsAdminDashboard';
import useAuthStore from './stores/useAuthStore';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />

      <Route path="/" element={<Layout />}>
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="admin/dashboard" element={
          <ProtectedRoute roles={['city_admin', 'state_admin', 'central_admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="admin/news-dashboard" element={
          <ProtectedRoute roles={['news_admin', 'central_admin']}>
            <NewsAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="admin/news/create" element={
          <ProtectedRoute roles={['news_admin', 'central_admin']}>
            <CreateNews />
          </ProtectedRoute>
        } />

        <Route path="admin/manage-admins" element={
          <ProtectedRoute roles={['central_admin', 'state_admin']}>
            <ManageAdmins />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;