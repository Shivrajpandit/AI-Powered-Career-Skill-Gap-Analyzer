import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User as UserIcon, LogOut, FileText, Briefcase, BarChart3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow-brand group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
              SkillGap AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Pro
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/resumes/upload"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <FileText className="w-4 h-4 text-brand-400" />
              Upload Resume
            </Link>
            <Link
              to="/jobs/new"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Analyze Job
            </Link>
            <Link
              to="/jobs/compare"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Compare Jobs
            </Link>

            {/* Profile Dropdown / Actions */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-700/60">
              <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-200 hover:text-brand-300 transition">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-brand-400">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-xs">{user.full_name}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-4 py-2 rounded-lg shadow-glow-brand transition"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
