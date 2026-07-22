import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Core Dashboard & Profile Pages
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

// Lost & Found Pages
import ReportLost from './pages/LostItems/ReportLost';
import ReportFound from './pages/FoundItems/ReportFound';
import LostDetails from './pages/LostItems/LostDetails';
import FoundDetails from './pages/FoundItems/FoundDetails';

// Claims, Chat, & Meetings Pages
import ClaimsPage from './pages/Claims/ClaimsPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] flex flex-col font-sans">
            <Navbar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Public Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Application Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lost-item/new"
                  element={
                    <ProtectedRoute>
                      <ReportLost />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lost-item/:id"
                  element={
                    <ProtectedRoute>
                      <LostDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/found-item/new"
                  element={
                    <ProtectedRoute>
                      <ReportFound />
                    </ProtectedRoute>
                  }
                />
                {/* Alias route to safely handle /report-found redirects */}
                <Route
                  path="/report-found"
                  element={
                    <ProtectedRoute>
                      <ReportFound />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/found-item/:id"
                  element={
                    <ProtectedRoute>
                      <FoundDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/claims"
                  element={
                    <ProtectedRoute>
                      <ClaimsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:claimId"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}