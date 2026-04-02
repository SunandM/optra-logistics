import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Track from './pages/Track';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout title="Dashboard" subtitle="Overview of your logistics operations">
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/planning" element={
        <ProtectedRoute>
          <Layout title="Route Planning" subtitle="Plan and optimize delivery routes">
            <Planning />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/track" element={
        <ProtectedRoute>
          <Layout title="Track & Trace" subtitle="Real-time order tracking and monitoring">
            <Track />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout title="Orders" subtitle="Manage and monitor all orders">
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="admin">
          <Layout title="Reports" subtitle="Analytics and business intelligence">
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requiredRole="admin">
          <Layout title="Settings" subtitle="Manage your application settings and preferences">
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout title="My Profile" subtitle="Manage your personal information and security settings">
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
