import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import {
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  Sliders,
} from 'lucide-react';

const SAMPLE_JOB_TEMPLATES = [
  {
    title: 'Senior Python & ML Engineer',
    company: 'Nexus AI Technologies',
    text: `We are looking for a Senior Python & Machine Learning Engineer.
Requirements:
• 3+ years of experience in Python, FastAPI, and PostgreSQL.
• Hands-on proficiency with Scikit-Learn, PyTorch, and NLP.
• Experience building scalable REST APIs and containerized Docker services.
• Bachelor's or Master's degree in Computer Science or related quantitative field.

Preferred / Nice to Have:
• Experience with AWS (EC2, S3, ECS) and CI/CD pipelines.
• Familiarity with Power BI, Tableau, or React.
• Knowledge of LLMs and vector databases.`,
  },
  {
    title: 'Full Stack React & Node.js Developer',
    company: 'CloudScale Inc',
    text: `Seeking a talented Full Stack Developer to build our next-gen SaaS platform.
Requirements:
• Strong expertise in React, TypeScript, Tailwind CSS, and Next.js.
• Backend experience with Node.js, Express.js, and MongoDB.
• Solid understanding of REST APIs and Git version control.
• 2+ years of professional web development experience.

Preferred:
• Experience with Docker and AWS deployment.
• Knowledge of GraphQL and Redis caching.`,
  },
  {
    title: 'Senior Data Scientist & Analytics Lead',
    company: 'Apex Data Labs',
    text: `Apex Data Labs is hiring a Data Scientist.
Requirements:
• Strong proficiency in SQL, Python, Pandas, and NumPy.
• Deep understanding of Statistics, Hypothesis Testing, and Exploratory Data Analysis.
• Hands-on dashboard creation with Power BI or Tableau.
• 3+ years of practical data analytics experience.

Nice to have:
• Machine learning experience (Scikit-Learn, XGBoost).
• Big data tools (Apache Spark, Airflow).`,
  },
];

export const JobInputPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resume_id');

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectedResumeId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await api.getResumes();
        setResumes(data);
        if (!selectedResumeId && data.length > 0) {
          setSelectedResumeId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load resumes', err);
      }
    };
    loadResumes();
  }, []);

  const handleApplyTemplate = (tmpl: (typeof SAMPLE_JOB_TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setCompany(tmpl.company);
    setRawText(tmpl.text);
  };

  const handleAnalyzeAndMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please upload or select a resume to match against.');
      return;
    }
    if (!rawText.trim()) {
      setError('Please paste a job description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Analyze and save Job Description
      const savedJob = await api.analyzeJob({
        title: title.trim() || 'Target Position',
        company: company.trim() || undefined,
        raw_text: rawText.trim(),
      });

      // 2. Perform Match Analysis
      const analysis = await api.matchResumeToJob(selectedResumeId, savedJob.id);

      // 3. Automatically generate learning roadmap
      try {
        await api.generateRoadmap(analysis.id, 12);
      } catch (e) {
        console.warn('Roadmap auto-generation deferred', e);
      }

      // 4. Redirect to Analysis Results
      navigate(`/analysis/${analysis.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Job Description & Skill Matcher</h1>
        <p className="text-xs text-slate-400">
          Paste any job posting text to extract required skills, evaluate your resume compatibility, and calculate your transparent match score.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Job Templates */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Quick Demo Templates
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_JOB_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3.5 rounded-2xl glass-panel hover:border-brand-500/40 text-left transition space-y-1 group"
            >
              <h4 className="text-xs font-bold text-white group-hover:text-brand-300 transition">
                {tmpl.title}
              </h4>
              <p className="text-[11px] text-slate-400">{tmpl.company}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAnalyzeAndMatch} className="space-y-6">
        {/* Resume Selection */}
        <div className="p-6 rounded-3xl glass-panel space-y-3">
          <label className="block text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            1. Select Resume to Compare Against
          </label>
          {resumes.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>No uploaded resumes found.</span>
              <button
                type="button"
                onClick={() => navigate('/resumes/upload')}
                className="text-brand-400 font-semibold hover:underline"
              >
                Upload Resume First →
              </button>
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} ({r.skills.length} skills detected, {r.completeness_score}% completeness)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Job Details Card */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <label className="block text-xs font-bold text-white uppercase tracking-wider text-slate-400">
            2. Job Information
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Company Name (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, OpenAI"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Job Description Requirements & Responsibilities
            </label>
            <textarea
              required
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the full job description text here, including requirements, responsibilities, and qualifications..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono transition"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || resumes.length === 0}
            className="px-8 py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-90 shadow-glow-brand flex items-center gap-2 disabled:opacity-40 transition"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing & Running AI Semantic Match...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Analyze Job & Calculate Match
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
