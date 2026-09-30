import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Resume, JobDescription, Analysis } from '../types';
import { ScoreDial } from '../components/common/ScoreDial';
import { SkillBadge } from '../components/common/SkillBadge';
import {
  FileText,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Compass,
  Play,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick match state
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesData, jobsData, analysesData] = await Promise.all([
          api.getResumes(),
          api.getJobs(),
          api.getAnalyses(),
        ]);
        setResumes(resumesData);
        setJobs(jobsData);
        setAnalyses(analysesData);

        if (resumesData.length > 0) setSelectedResumeId(resumesData[0].id);
        if (jobsData.length > 0) setSelectedJobId(jobsData[0].id);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobId) return;
    setMatching(true);
    try {
      const result = await api.matchResumeToJob(selectedResumeId, selectedJobId);
      navigate(`/analysis/${result.id}`);
    } catch (err) {
      console.error('Match failed', err);
    } finally {
      setMatching(false);
    }
  };

  const highestScore = analyses.length
    ? Math.max(...analyses.map((a) => a.overall_match_score))
    : 0;

  const averageScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.overall_match_score, 0) / analyses.length)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Loading your AI career workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            AI Career Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Engineer'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor ATS compatibility across target roles, identify high-priority missing skills, and track your personalized 12-week upskilling roadmaps.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <Link
            to="/resumes/upload"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 shadow-glow-brand transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Upload Resume
          </Link>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-slate-200 text-xs font-bold bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Analyze New Job
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Parsed Resumes</span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-metric text-3xl font-extrabold text-white mt-3">{resumes.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Multi-page parsed documents</p>
        </div>

        <div className="p-5 rounded-3xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Target Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-metric text-3xl font-extrabold text-white mt-3">{jobs.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Saved job descriptions</p>
        </div>

        <div className="p-5 rounded-3xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Analyses Run</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-metric text-3xl font-extrabold text-white mt-3">{analyses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Semantic match reports</p>
        </div>

        <div className="p-5 rounded-3xl glass-panel glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Peak Compatibility</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-metric text-3xl font-extrabold text-emerald-400 mt-3">{Math.round(highestScore)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {averageScore > 0 ? `Avg match: ${averageScore}%` : 'Highest target match'}
          </p>
        </div>
      </div>

      {/* Quick Match Launcher (if user has at least 1 resume & job) */}
      {resumes.length > 0 && jobs.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel border border-brand-500/20 bg-gradient-to-r from-brand-950/40 via-slate-900/60 to-indigo-950/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider">
                <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                Instant Skill Gap Analysis
              </div>
              <p className="text-xs text-slate-300 mt-1">Select an active resume and target role to run a new transparent ATS evaluation.</p>
            </div>
          </div>

          <form onSubmit={handleQuickMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} ({r.skills?.length || 0} skills)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Select Target Job</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.company || 'Direct'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:self-end">
              <button
                type="submit"
                disabled={matching}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-90 transition shadow-glow-brand flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {matching ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Calculating Match...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Match Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Match Analyses</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {analyses.length} Total
            </span>
          </div>
          {resumes.length > 0 && jobs.length > 0 && (
            <Link
              to="/jobs/new"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 transition"
            >
              Analyze New Job <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">No match analyses yet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload your resume and enter a target job description to generate your first transparent skill gap and compatibility audit.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <Link
                to="/resumes/upload"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition"
              >
                1. Upload Resume
              </Link>
              <Link
                to="/jobs/new"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
              >
                2. Analyze Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((analysis) => {
              const matchedResume = resumes.find((r) => r.id === analysis.resume_id);
              const matchedJob = jobs.find((j) => j.id === analysis.job_id);

              return (
                <Link
                  key={analysis.id}
                  to={`/analysis/${analysis.id}`}
                  className="p-6 rounded-3xl glass-panel glass-panel-hover flex items-center justify-between group relative overflow-hidden"
                >
                  <div className="space-y-2 max-w-[65%]">
                    <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {matchedJob?.company || 'Target Role'}
                    </div>
                    <h3 className="text-base font-bold text-white truncate group-hover:text-brand-300 transition">
                      {matchedJob?.title || 'Job Match Analysis'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {matchedResume?.file_name || 'Candidate Resume'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        Skills: <strong className="text-emerald-400">{Math.round(analysis.skill_match_score)}%</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        Exp: <strong className="text-brand-400">{Math.round(analysis.experience_match_score)}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-3">
                    <ScoreDial score={analysis.overall_match_score} size={90} strokeWidth={8} label="Match" showBadge={false} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

