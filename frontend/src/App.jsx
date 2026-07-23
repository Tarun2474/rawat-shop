// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Import Components
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';

// Import Pages
import Home from './pages/Home';
import Stickers from './pages/Stickers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUpload from './pages/AdminUpload';
import AdminManage from './pages/AdminManage';
import AdminSettings from './pages/AdminSettings';

// Helper component for protecting Admin routes
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Admin Layout Component with Sidebar
const AdminLayout = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[var(--bg-color)]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative transition-colors duration-300">
          <Navbar />
          
          <main className="flex-1 flex flex-col w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/stickers" element={<Stickers />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Admin Login Route */}
              <Route path="/admin" element={<AdminLogin />} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/upload" element={
                <ProtectedRoute>
                  <AdminLayout><AdminUpload /></AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/manage" element={
                <ProtectedRoute>
                  <AdminLayout><AdminManage /></AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminLayout><AdminSettings /></AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch all route - Redirects to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;