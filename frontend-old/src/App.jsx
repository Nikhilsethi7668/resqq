import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/user/Home';
import CreateSOS from './pages/user/CreateSOS';
import MyPosts from './pages/user/MyPosts';
import PostDetails from './pages/user/PostDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateNews from './pages/admin/CreateNews';
import HowItWorks from './pages/public/HowItWorks';
import SuccessStories from './pages/public/SuccessStories';

import NewsFeed from './pages/public/NewsFeed';
import useAuthStore from './stores/useAuthStore';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="news" element={<NewsFeed />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="success-stories" element={<SuccessStories />} />
          <Route path="report" element={<CreateSOS />} /> {/* Public Report Emergency Route */}

          {/* User Routes */}
          <Route path="post/new" element={
            <ProtectedRoute roles={['user']}>
              <CreateSOS />
            </ProtectedRoute>
          } />
          <Route path="my-posts" element={
            <ProtectedRoute roles={['user']}>
              <MyPosts />
            </ProtectedRoute>
          } />
          <Route path="post/:id" element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute roles={['city_admin', 'state_admin', 'central_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin/news" element={
            <ProtectedRoute roles={['news_admin', 'central_admin']}>
              <CreateNews />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
