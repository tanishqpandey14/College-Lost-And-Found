import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Helper component to handle dynamic browser page titles
function PageTitleHandler() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Static route titles
    const titles = {
      '/login': 'Login - Lost & Found',
      '/register': 'Register - Lost & Found',
      '/': 'Dashboard',
      '/lost-item/new': 'Lost Item',
      '/found-item/new': 'Found Item',
      '/report-found': 'Found Item',
      '/claims': 'Claims',
      '/profile': 'Profile',
    };

    if (titles[path]) {
      document.title = titles[path];
    } else if (path.startsWith('/chat/')) {
      document.title = 'Chat';
    } else if (path.startsWith('/lost-item/')) {
      document.title = 'Lost Item Details';
    } else if (path.startsWith('/found-item/')) {
      document.title = 'Found Item Details';
    } else {
      document.title = 'College Lost & Found';
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <PageTitleHandler />
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