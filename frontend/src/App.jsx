import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Teams from './pages/Teams';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Announcements from './pages/Announcements';
import TeamChat from './pages/TeamChat';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          {/* Toast Notification Container */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '12px',
                borderRadius: '12px',
                padding: '10px 16px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F8FAFC',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Dashboard Routing */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="teams" element={<Teams />} />
              <Route path="projects" element={<Projects />} />
              <Route 
                path="tasks" 
                element={
                  <ProtectedRoute allowedRoles={['leader', 'member']}>
                    <Tasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="announcements" 
                element={
                  <ProtectedRoute allowedRoles={['mentor', 'leader', 'member']}>
                    <Announcements />
                  </ProtectedRoute>
                } 
              />
              
              {/* Chat path only open to roles assigned to team (members, leaders, mentors) */}
              <Route 
                path="chat" 
                element={
                  <ProtectedRoute allowedRoles={['mentor', 'leader', 'member']}>
                    <TeamChat />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Catch-all Routing redirects to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
