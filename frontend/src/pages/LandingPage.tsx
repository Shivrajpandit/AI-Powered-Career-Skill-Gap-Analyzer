import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../layouts/Navbar';
import {
  Sparkles,
  FileCheck,
  Target,
  Route,
  Zap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Explainable AI • Semantic Skill Matching • Personalized Roadmaps
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Bridge the Gap Between Your{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Resume
            </span>{' '}
            and Your Dream{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Career
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Stop guessing why your resume isn't getting interviews. Upload your resume, analyze any target job description, uncover missing skills with transparent mathematical audit logs, and get a week-by-week learning roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-90 shadow-glow-brand transition"
            >
              Analyze Your Resume Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-slate-300 font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition"
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl glass-panel hover:border-brand-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Multi-Page Document Parser</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Extracts contact, education, experience, and skills from PDF & DOCX resumes with full editable review controls.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-indigo-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Semantic AI Matching</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uses 384-dimensional vector embeddings with collision-safe rules to recognize synonyms while preserving precision.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-purple-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Route className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Personalized Learning Roadmap</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates a customized 12-week study plan with hands-on capstone project ideas and curated official documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Methodology Section */}
      <section className="py-16 px-6 border-t border-white/5 bg-slate-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Built on Explainable, Transparent Engineering
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              No black-box hallucinations. Every match score is calculated transparently with visible mathematical weight contributions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Skill Match (60%)</h4>
                <p className="text-xs text-slate-400 mt-1">Weighted required vs. preferred technical skills.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Experience (20%)</h4>
                <p className="text-xs text-slate-400 mt-1">Analyzed candidate years vs. job minimum requirements.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Education (10%)</h4>
                <p className="text-xs text-slate-400 mt-1">Degree level alignment and academic qualifications.</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Keywords (10%)</h4>
                <p className="text-xs text-slate-400 mt-1">Direct responsibility and domain relevance overlap.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-white/5 text-center text-xs text-slate-400">
        AI-Powered Career & Skill Gap Analyzer • Production Full-Stack Portfolio Project
      </footer>
    </div>
  );
};
