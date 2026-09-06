import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { JobDescription } from '../types';
import { Briefcase, Plus, Trash2, ArrowRight, Layers } from 'lucide-react';
import { SkillBadge } from '../components/common/SkillBadge';

export const JobListPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this job description?')) return;
    try {
      await api.deleteJob(id);
      setJobs(jobs.filter((j) => j.id !== id));
    } catch (err) {
      alert('Failed to delete job description.');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Target Jobs</h1>
          <p className="text-xs text-slate-400">Manage your saved job descriptions and requirement sets.</p>
        </div>
        <Link
          to="/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow-brand transition"
        >
          <Plus className="w-4 h-4" />
          Add Target Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No target jobs saved yet</h3>
            <p className="text-xs text-slate-400 mt-1">Paste a job posting to extract requirements and match skills.</p>
          </div>
          <Link
            to="/jobs/new"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Analyze First Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl glass-panel hover:border-indigo-500/40 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {job.company || 'Direct Posting'}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{job.title}</h3>
                  </div>

                  <button
                    onClick={(e) => handleDelete(job.id, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete job description"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Exp: {job.parsed_requirements?.experience_summary || 'Not specified'}</span>
                  <span>•</span>
                  <span>{job.skills.length} Required / Preferred Skills</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.slice(0, 6).map((s) => (
                    <SkillBadge
                      key={s.id}
                      name={s.skill_name}
                      category={s.category}
                      type={s.importance === 'required' ? 'missing' : 'neutral'}
                      priority={s.importance === 'required' ? 'HIGH' : 'MEDIUM'}
                    />
                  ))}
                  {job.skills.length > 6 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{job.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Link
                  to={`/jobs/new?job_id=${job.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Run Match Analysis <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
