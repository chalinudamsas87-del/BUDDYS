import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import {
  NotificationsPage, MarketplacePage, QuizzesPage,
  WatchPage, MemoriesPage, SettingsPage
} from './pages/MiscPages';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={currentUser ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<PrivateRoute><Layout><HomePage /></Layout></PrivateRoute>} />
      <Route path="/profile/:uid" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Layout><NotificationsPage /></Layout></PrivateRoute>} />
      <Route path="/marketplace" element={<PrivateRoute><Layout><MarketplacePage /></Layout></PrivateRoute>} />
      <Route path="/quizzes" element={<PrivateRoute><Layout><QuizzesPage /></Layout></PrivateRoute>} />
      <Route path="/watch" element={<PrivateRoute><Layout><WatchPage /></Layout></PrivateRoute>} />
      <Route path="/memories" element={<PrivateRoute><Layout><MemoriesPage /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminRoute><Layout><AdminPage /></Layout></AdminRoute></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161e',
              color: '#f0f0f8',
              border: '1px solid #2a2a3a',
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#16161e' } },
            error: { iconTheme: { primary: '#ff4d6d', secondary: '#16161e' } }
          }}
        />
      </AuthProvider>
    </Router>
  );
}
