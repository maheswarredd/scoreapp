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
      {/* Footer */}
<footer className="border-t border-crex-border bg-[#0a0e1a] py-6 text-center text-xs text-slate-500">
  <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">

    {/* Main Footer Line */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
      <span className="font-extrabold text-blue-500">
        CREX
      </span>

      <span>• Sunday Match Live Score Engine</span>

      <span className="hidden sm:inline">•</span>

      <span className="font-semibold text-slate-300">
        Developed by
        <span className="ml-1 text-blue-400 font-extrabold">
          Reddy
        </span>
      </span>
    </div>

    {/* Social Links */}
    <div className="flex flex-wrap items-center justify-center gap-3">

      <a
        href="https://www.instagram.com/maheswar_reddy__18/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 font-semibold hover:bg-pink-500/20 hover:border-pink-400 transition-all"
      >
        Instagram: @maheswar_reddy__18
      </a>

      <a
        href="https://www.facebook.com/maheswarreddy"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/20 hover:border-blue-400 transition-all"
      >
        Facebook: maheswarreddy
      </a>

      <a
        href="https://github.com/ReddyDeveloper"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-300 font-semibold hover:bg-slate-500/20 hover:border-slate-400 transition-all"
      >
        GitHub: ReddyDeveloper
      </a>

    </div>

    {/* Copyright */}
    <p>
      © 2026 CREX Live Score Clone. All rights reserved By Reddy.
    </p>

  </div>
</footer>
    </div>
  );
}
