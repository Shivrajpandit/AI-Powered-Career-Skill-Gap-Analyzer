import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Resume, JobDescription, Analysis } from '../types';
import { ScoreDial } from '../components/common/ScoreDial';
import {
  FileText,
  Briefcase,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Compass,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const highestScore = analyses.length
    ? Math.max(...analyses.map((a) => a.overall_match_score))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            AI Career Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Analyze your resume against open job roles, identify high-priority skill gaps, and follow tailored learning roadmaps.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <Link
            to="/resumes/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition"
          >
            <Plus className="w-4 h-4" />
            Upload Resume
          </Link>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-200 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Analyze Job
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Uploaded Resumes</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{resumes.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Multi-page parsed documents</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Target Jobs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{jobs.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Saved job descriptions</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Match Analyses</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{analyses.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Semantic match reports</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Peak Compatibility</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3">{Math.round(highestScore)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Highest target match</p>
        </div>
      </div>

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Match Analyses</h2>
          {resumes.length > 0 && jobs.length > 0 && (
            <Link
              to="/jobs/new"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
            >
              Run New Match <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-semibold text-white">No match analyses yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload a resume and enter a target job description to generate your first transparent skill gap and compatibility report.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/resumes/upload"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition"
              >
                1. Upload Resume
              </Link>
              <Link
                to="/jobs/new"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
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
                  className="p-5 rounded-2xl glass-panel hover:border-brand-500/40 hover:bg-slate-900/80 transition flex items-center justify-between group"
                >
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {matchedJob?.company || 'Target Job'}
                    </div>
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-300 transition">
                      {matchedJob?.title || 'Job Match Analysis'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      Resume: {matchedResume?.file_name || 'Candidate Resume'}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>Skills: {Math.round(analysis.skill_match_score)}%</span>
                      <span>•</span>
                      <span>Exp: {Math.round(analysis.experience_match_score)}%</span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-4">
                    <ScoreDial score={analysis.overall_match_score} size={84} strokeWidth={8} label="Match" />
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
