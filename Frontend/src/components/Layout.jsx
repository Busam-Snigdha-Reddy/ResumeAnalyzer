import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FileSearch, LogOut, LayoutDashboard, UploadCloud, Cpu } from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/75 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-all">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-display">
              ATS<span className="text-indigo-400">Pro</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'bg-slate-800 text-white border border-slate-700/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/upload')
                      ? 'bg-slate-800 text-white border border-slate-700/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload
                </Link>
                <div className="h-4 w-px bg-slate-800 mx-2" />
                <span className="text-sm font-medium text-slate-300 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-full">
                  Hello, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 ml-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} ATS Pro. Powered by Deep Generative Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};
