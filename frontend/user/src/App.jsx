import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import CreateSOS from './pages/CreateSOS';
import MyPosts from './pages/MyPosts';
import PostDetails from './pages/PostDetails';
import HowItWorks from './pages/HowItWorks';
import SuccessStories from './pages/SuccessStories';
import NewsFeed from './pages/NewsFeed';
import useAuthStore from './stores/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
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
          <Route path="report" element={<CreateSOS />} />

          <Route path="my-posts" element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          } />
          <Route path="post/:id" element={
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;