import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MatchDetailPage from './pages/MatchDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCreateMatchPage from './pages/AdminCreateMatchPage';
import AdminScoringConsolePage from './pages/AdminScoringConsolePage';

// Protected Route Component for Admin
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<HomePage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/matches/create"
            element={
              <ProtectedAdminRoute>
                <AdminCreateMatchPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/scoring/:id"
            element={
              <ProtectedAdminRoute>
                <AdminScoringConsolePage />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="border-t border-crex-border bg-[#0a0e1a] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-blue-500">CREX</span>
            <span>• Cricket Exchange Live Score Engine</span>
          </div>
          <p>© 2026 CREX Live Score Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
