import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Zap,
  Map,
  Layers,
  UserCheck,
  Settings as SettingsIcon,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resumes', label: 'My Resumes', icon: FileText },
    { to: '/resumes/upload', label: 'Upload Resume', icon: Zap },
    { to: '/jobs', label: 'Target Jobs', icon: Briefcase },
    { to: '/jobs/new', label: 'Analyze Job', icon: Layers },
    { to: '/jobs/compare', label: 'Job Rankings', icon: UserCheck },
    { to: '/profile', label: 'Profile & Audit', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col justify-between p-4 hidden lg:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Workspace
          </p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-indigo-600/20 text-brand-300 border border-brand-500/30 font-semibold shadow-glow-brand'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Pro Tip Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/30 via-slate-900/40 to-slate-900/90 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-1.5">
            <Zap className="w-4 h-4 text-indigo-400" />
            Explainable AI Tip
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every match score links directly to sentence excerpts from your resume and the job description.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
        AI Career & Skill Gap Analyzer v1.0
      </div>
    </aside>
  );
};
