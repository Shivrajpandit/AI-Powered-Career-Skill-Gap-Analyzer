import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, FileText, Briefcase, BarChart3, LayoutDashboard, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-all">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent tracking-tight">
                SkillGap AI
              </span>
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-bold">
                Explainable
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation items */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                isLinkActive('/dashboard')
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
              Dashboard
            </Link>

            <Link
              to="/resumes/upload"
              className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                isLinkActive('/resumes/upload')
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Upload Resume
            </Link>

            <Link
              to="/jobs/new"
              className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                isLinkActive('/jobs/new')
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              Match Job
            </Link>

            <Link
              to="/jobs/compare"
              className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
                isLinkActive('/jobs/compare')
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              Compare
            </Link>

            {/* Profile Dropdown / Actions */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-xs text-slate-200">{user.full_name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800/80 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 px-4.5 py-2 rounded-xl shadow-glow-brand transition"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

