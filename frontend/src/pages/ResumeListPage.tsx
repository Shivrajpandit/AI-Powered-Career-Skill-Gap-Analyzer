import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import { FileText, Plus, Trash2, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SkillBadge } from '../components/common/SkillBadge';

export const ResumeListPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data);
    } catch (err) {
      console.error('Failed to load resumes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Resumes</h1>
          <p className="text-xs text-slate-400">Manage your uploaded resumes and extracted skills.</p>
        </div>
        <Link
          to="/resumes/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition"
        >
          <Plus className="w-4 h-4" />
          Upload New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No resumes uploaded yet</h3>
            <p className="text-xs text-slate-400 mt-1">Upload a PDF or DOCX file to get started.</p>
          </div>
          <Link
            to="/resumes/upload"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition"
          >
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="p-6 rounded-3xl glass-panel hover:border-brand-500/40 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                        {resume.file_name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Uploaded {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(resume.id, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Completeness: {Math.round(resume.completeness_score)}%</span>
                  </div>
                  <span>•</span>
                  <span>{resume.skills.length} Skills Detected</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resume.skills.slice(0, 6).map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {s.skill_name}
                    </span>
                  ))}
                  {resume.skills.length > 6 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{resume.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/jobs/new?resume_id=${resume.id}`}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  Match Against Job <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
