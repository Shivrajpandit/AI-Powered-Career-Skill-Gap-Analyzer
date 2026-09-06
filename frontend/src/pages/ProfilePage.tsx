import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Resume, QualityAudit } from '../types';
import {
  User as UserIcon,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
} from 'lucide-react';
import { ScoreDial } from '../components/common/ScoreDial';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [audit, setAudit] = useState<QualityAudit | null>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await api.getResumes();
        setResumes(data);
        if (data.length > 0) {
          setSelectedResumeId(data[0].id);
          runAudit(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load resumes for audit', err);
      }
    };
    loadResumes();
  }, []);

  const runAudit = async (resumeId: string) => {
    setAuditing(true);
    try {
      const auditResult = await api.auditResumeQuality(resumeId);
      setAudit(auditResult);
    } catch (err) {
      console.error('Failed to audit resume', err);
    } finally {
      setAuditing(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    try {
      await api.updateProfile({
        full_name: fullName,
        email,
        password: password ? password : undefined,
      });
      await refreshUser();
      setProfileMsg('Profile updated successfully.');
      setPassword('');
    } catch (err: any) {
      setProfileMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Resume Quality Auditor</h1>
        <p className="text-xs text-slate-400">
          Manage your account credentials and audit your resume against technical hiring benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Profile Information</h3>
              <p className="text-[11px] text-slate-400">Update account credentials</p>
            </div>
          </div>

          {profileMsg && (
            <div className="p-3 rounded-xl bg-slate-900 border border-brand-500/30 text-xs text-brand-300">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Change Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl text-white font-semibold bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        </div>

        {/* Resume Quality Auditor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Resume Quality Auditor</h3>
                  <p className="text-[11px] text-slate-400">Deep structural & measurable impact audit</p>
                </div>
              </div>

              {resumes.length > 0 && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    runAudit(e.target.value);
                  }}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.file_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {auditing ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Auditing resume metrics, structure, and action verbs...
              </div>
            ) : audit ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <ScoreDial score={audit.overall_quality_score} size={110} strokeWidth={10} label="Quality" />
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-base font-bold text-white">Rating: {audit.rating}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        {audit.overall_quality_score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Evaluated against quantifiable metrics, active vs passive verbs, section completeness, and optimal formatting length.
                    </p>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Key Strengths ({audit.strengths.length})
                  </span>
                  <div className="space-y-1.5">
                    {audit.strengths.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Suggestions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Actionable Recommendations ({audit.actionable_improvements.length})
                  </span>
                  <div className="space-y-2">
                    {audit.actionable_improvements.map((imp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                        • {imp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Upload a resume to run the quality audit.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
