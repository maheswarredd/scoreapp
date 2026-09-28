import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Activity, ShieldCheck, LogOut, Radio, Trophy, Calendar } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();

  const navItems = [
    { label: 'Live Matches', path: '/?tab=live', icon: Radio, highlight: true },
    { label: 'Upcoming', path: '/?tab=upcoming', icon: Calendar },
    { label: 'Completed', path: '/?tab=completed', icon: Trophy }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0e1424]/95 backdrop-blur border-b border-crex-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-xl tracking-tighter">CX</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-wider text-white">CREX</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white font-bold tracking-widest uppercase animate-pulse">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 tracking-wider font-medium -mt-1">
                  CRICKET EXCHANGE
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.search === item.path.replace('/', '') || 
                  (item.path === '/?tab=live' && (location.pathname === '/' && (!location.search || location.search === '?tab=live')));

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-red-500' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action buttons & status */}
          <div className="flex items-center space-x-3">
            {/* Live Socket Connection Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-slate-400 text-[11px] font-medium">
                {isConnected ? 'Sync: Real-time' : 'Connecting...'}
              </span>
            </div>

            {/* Admin Panel button */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout Admin"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
