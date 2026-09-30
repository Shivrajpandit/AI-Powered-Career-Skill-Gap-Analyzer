import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Zap,
  Layers,
  BarChart3,
  UserCheck,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes', label: 'My Resumes', icon: FileText },
    { to: '/resumes/upload', label: 'Upload Resume', icon: Zap },
    { to: '/jobs', label: 'Target Jobs', icon: Briefcase },
    { to: '/jobs/new', label: 'Analyze Job', icon: Layers },
    { to: '/jobs/compare', label: 'Job Rankings', icon: BarChart3 },
    { to: '/profile', label: 'Profile & Audit', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col justify-between p-4 hidden lg:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Main Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/20 via-indigo-500/15 to-transparent text-brand-300 border border-brand-500/30 shadow-[0_0_20px_-5px_rgba(12,142,232,0.3)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-0.5'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Explainability Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/60 via-slate-900/80 to-slate-900/90 border border-brand-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-brand-300 font-bold text-xs mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Transparent AI Scoring
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Every match links to actual mathematical weights (60% Skills, 20% Exp, 10% Edu, 10% Keywords).
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Production Explainable AI v1.0
      </div>
    </aside>
  );
};

