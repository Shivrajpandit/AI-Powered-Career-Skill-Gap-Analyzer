import React, { useState } from 'react';
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
  XCircle,
  HelpCircle,
  Layers,
  Award,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { SkillBadge } from '../components/common/SkillBadge';
import { ScoreDial } from '../components/common/ScoreDial';

export const LandingPage: React.FC = () => {
  const [activeDemoTab, setActiveDemoTab] = useState<'match' | 'gaps' | 'roadmap'>('match');

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col selection:bg-brand-500/30 selection:text-brand-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Glow Elements */}
        <div className="ambient-glow top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-purple-600/15" />
        <div className="ambient-glow top-40 -left-20 w-[400px] h-[400px] bg-emerald-500/10" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold mb-8 animate-fade-in shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Explainable AI • Semantic Skill Matching • 12-Week Personal Roadmaps
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] mb-6">
            Know Exactly Why Your Resume Fits{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              — And How To Fix What’s Missing.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Stop guessing with opaque black-box ATS scorers. Get transparent mathematical score breakdowns, semantic synonym intelligence, and a structured 12-week upskilling roadmap tailored to your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow-brand transition-all hover:scale-[1.02]"
            >
              Analyze Your Resume Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-slate-200 font-semibold text-sm bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition"
            >
              Sign In to Workspace
            </Link>
          </div>

          {/* Interactive Live Demo Preview Card */}
          <div className="max-w-4xl mx-auto rounded-3xl glass-panel-glow p-6 sm:p-8 text-left relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30 mb-1.5">
                  Interactive Live Preview
                </div>
                <h3 className="text-lg font-bold text-white">Full Stack AI Engineer @ Stripe</h3>
                <p className="text-xs text-slate-400">Target Requirements vs. Extracted Candidate Profile</p>
              </div>

              {/* Demo Tabs */}
              <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveDemoTab('match')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeDemoTab === 'match' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Score Breakdown
                </button>
                <button
                  onClick={() => setActiveDemoTab('gaps')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeDemoTab === 'gaps' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Skill Intelligence
                </button>
                <button
                  onClick={() => setActiveDemoTab('roadmap')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeDemoTab === 'roadmap' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  12-Week Roadmap
                </button>
              </div>
            </div>

            {/* Tab 1: Match Score Breakdown */}
            {activeDemoTab === 'match' && (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <ScoreDial score={84} size={150} strokeWidth={12} label="Compatibility" />
                  <p className="text-[11px] text-slate-400 mt-2 text-center">Top 15% Candidate Alignment</p>
                </div>

                <div className="md:col-span-2 space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-200">Required Skills Weight (60%)</span>
                      <span className="text-emerald-400 font-metric font-bold">88%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-200">Experience Alignment (20%)</span>
                      <span className="text-brand-400 font-metric font-bold">80%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '80%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-200">Education & Background (10%)</span>
                      <span className="text-indigo-400 font-metric font-bold">90%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-200">Domain Keywords Overlap (10%)</span>
                      <span className="text-purple-400 font-metric font-bold">75%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Skill Gaps */}
            {activeDemoTab === 'gaps' && (
              <div className="pt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <SkillBadge name="Python" type="matched" category="Backend" />
                    <SkillBadge name="FastAPI" type="matched" category="Backend" />
                    <SkillBadge name="PostgreSQL" type="matched" category="Databases" />
                    <SkillBadge name="Docker" type="matched" category="Cloud & DevOps" />
                    <SkillBadge name="TypeScript" type="matched" category="Frontend" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Semantic Matches (384D Embeddings)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <SkillBadge name="PyTorch" type="related" category="AI" similarity={0.88} evidence="Matched with Deep Learning" />
                    <SkillBadge name="AWS Lambda" type="related" category="Cloud" similarity={0.82} evidence="Matched with Serverless" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Priority Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <SkillBadge name="Kubernetes" type="missing" priority="HIGH" category="Cloud & DevOps" />
                    <SkillBadge name="Redis Caching" type="missing" priority="MEDIUM" category="Databases" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Roadmap */}
            {activeDemoTab === 'roadmap' && (
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-brand-400">Weeks 1 - 4 • Phase 1</div>
                  <h5 className="text-xs font-bold text-white mt-1">Cloud Infrastructure & Kubernetes</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Master cluster orchestration and helm charts.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-indigo-400">Weeks 5 - 8 • Phase 2</div>
                  <h5 className="text-xs font-bold text-white mt-1">Distributed Cache & Redis</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Implement write-through caching and pub/sub.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-purple-400">Weeks 9 - 12 • Phase 3</div>
                  <h5 className="text-xs font-bold text-white mt-1">Capstone Portfolio Architecture</h5>
                  <p className="text-[11px] text-slate-400 mt-1">Deploy end-to-end cloud-native microservices.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5 bg-slate-950/40 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Engineered for Precision & Explainability
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Built from the ground up to replace arbitrary percentage guesses with deterministic, reproducible, and explainable AI algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-brand mb-5">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Multi-Format Document Parsing</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Extracts structured contact info, education degrees, employment timelines, and skill lists from PDF and DOCX documents with PyMuPDF and fuzzy pattern matching.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-brand-300 font-semibold flex items-center gap-1">
                Zero Data Loss Guarantee <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </div>
            </div>

            <div className="p-7 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-glow-indigo mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">500+ Skill Ontology + Semantic Embeddings</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Normalized taxonomy across 8 tech domains combines canonical aliases with dense 384-dimensional vector embeddings and false-positive collision guards.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
                Collision-Safe Matching <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </div>
            </div>

            <div className="p-7 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-glow-brand mb-5">
                  <Route className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">Actionable 12-Week Roadmap</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automatically turns detected missing skills into a week-by-week learning syllabus complete with milestone checklists, study hours, and capstone project blueprints.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                Project-Driven Upskilling <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto py-10 px-6 border-t border-white/5 text-center bg-[#060910]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-400">
            <Sparkles className="w-4 h-4" />
            Empowering modern developers and career changers worldwide.
          </div>
          <p className="text-xs text-slate-400">
            AI-Powered Career & Skill Gap Analyzer • Production Grade Full-Stack Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

