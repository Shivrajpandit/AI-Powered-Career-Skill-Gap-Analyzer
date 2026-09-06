import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Resume, JobDescription, CompareJobsResponse } from '../types';
import { ScoreDial } from '../components/common/ScoreDial';
import { BarChart3, ArrowRight, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const JobComparePage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<CompareJobsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [resumesData, jobsData] = await Promise.all([
          api.getResumes(),
          api.getJobs(),
        ]);
        setResumes(resumesData);
        setJobs(jobsData);
        if (resumesData.length > 0) setSelectedResumeId(resumesData[0].id);
        if (jobsData.length > 0) setSelectedJobIds(jobsData.slice(0, 3).map((j) => j.id));
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    loadInitialData();
  }, []);

  const handleToggleJob = (jobId: string) => {
    if (selectedJobIds.includes(jobId)) {
      setSelectedJobIds(selectedJobIds.filter((id) => id !== jobId));
    } else {
      setSelectedJobIds([...selectedJobIds, jobId]);
    }
  };

  const handleRunComparison = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume.');
      return;
    }
    if (selectedJobIds.length === 0) {
      setError('Please select at least one job to compare.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.compareJobs(selectedResumeId, selectedJobIds);
      setComparison(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to compare jobs.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparison?.rankings.map((r) => ({
    name: r.title.length > 20 ? r.title.substring(0, 18) + '...' : r.title,
    overallScore: Math.round(r.overall_match_score),
    skillScore: Math.round(r.skill_match_score),
  })) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Multi-Job Compatibility Comparison</h1>
        <p className="text-xs text-slate-400">
          Rank your resume against multiple job descriptions to discover where your skillset has the strongest competitive advantage.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Selector */}
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <label className="block text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            Select Active Resume
          </label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.file_name} ({r.skills.length} skills)
              </option>
            ))}
          </select>
        </div>

        {/* Job Checkboxes */}
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <label className="block text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            Select Target Jobs to Compare ({selectedJobIds.length} Selected)
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {jobs.map((job) => (
              <label
                key={job.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  selectedJobIds.includes(job.id)
                    ? 'bg-brand-500/10 border-brand-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedJobIds.includes(job.id)}
                  onChange={() => handleToggleJob(job.id)}
                  className="rounded bg-slate-800 border-slate-700 text-brand-500 focus:ring-0"
                />
                <span className="font-semibold truncate">{job.title}</span>
                {job.company && <span className="text-[10px] opacity-60">({job.company})</span>}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleRunComparison}
          disabled={loading || !selectedResumeId || selectedJobIds.length === 0}
          className="px-6 py-3 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-90 shadow-glow-brand flex items-center gap-2 disabled:opacity-40 transition"
        >
          <BarChart3 className="w-4 h-4" />
          {loading ? 'Evaluating Compatibility Matrix...' : 'Compare Compatibility & Rank Jobs'}
        </button>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6 animate-fade-in">
          {/* Comparison Bar Chart */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Role Match Comparison
            </h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1F293D', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="overallScore" name="Overall Match %" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#10B981' : '#0C8EE8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranked List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compatibility Rankings
            </h3>
            <div className="space-y-3">
              {comparison.rankings.map((item, idx) => (
                <div
                  key={item.job_id}
                  className={`p-5 rounded-3xl glass-panel flex items-center justify-between transition ${
                    idx === 0 ? 'border-emerald-500/40 bg-emerald-950/10 shadow-glow-emerald' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        idx === 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx === 0 ? <Trophy className="w-5 h-5 text-emerald-400" /> : `#${idx + 1}`}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        {idx === 0 && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            Best Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.company || 'Direct Job'} • Matched Skills: {item.matching_skills_count} • Missing Gaps: {item.missing_skills_count}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-4">
                    <ScoreDial score={item.overall_match_score} size={76} strokeWidth={8} label="Score" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
