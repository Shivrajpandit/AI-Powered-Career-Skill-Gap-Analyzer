import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Analysis, JobDescription, Resume } from '../types';
import { ScoreDial } from '../components/common/ScoreDial';
import { SkillBadge } from '../components/common/SkillBadge';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Route,
  ChevronDown,
  ChevronUp,
  Info,
  Briefcase,
  GraduationCap,
  Calculator,
  ArrowRight,
  Layers,
  FileText,
  Search,
  Filter,
  Check,
  Zap,
  Target,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [job, setJob] = useState<JobDescription | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'audit' | 'evidence'>('overview');
  const [skillFilter, setSkillFilter] = useState<'all' | 'matched' | 'related' | 'missing'>('all');
  const [searchSkill, setSearchSkill] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const analysisData = await api.getAnalysis(id);
        setAnalysis(analysisData);

        const [jobData, resumeData] = await Promise.all([
          api.getJob(analysisData.job_id),
          api.getResume(analysisData.resume_id),
        ]);
        setJob(jobData);
        setResume(resumeData);
      } catch (err) {
        console.error('Failed to load analysis details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Computing explainable skill matches and ATS scoring...</p>
      </div>
    );
  }

  const radarData = [
    { subject: 'Skills (60%)', score: analysis.skill_match_score, fullMark: 100 },
    { subject: 'Experience (20%)', score: analysis.experience_match_score, fullMark: 100 },
    { subject: 'Education (10%)', score: analysis.education_match_score, fullMark: 100 },
    { subject: 'Keywords (10%)', score: analysis.keyword_match_score, fullMark: 100 },
  ];

  const missingSkills = analysis.score_breakdown?.missing_skills || [];
  const matchingSkills = analysis.score_breakdown?.matching_skills || [];
  const relatedSkills = analysis.score_breakdown?.related_skills || [];

  const totalEvaluatedSkills = matchingSkills.length + relatedSkills.length + missingSkills.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="ambient-glow top-0 right-0 w-64 h-64 bg-brand-500/10 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Explainable AI Evaluation Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {job?.title || 'Job Compatibility'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-brand-400" />
              Company: <strong className="text-white">{job?.company || 'Target Role'}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Resume: <strong className="text-white">{resume?.file_name}</strong>
            </span>
          </div>
        </div>

        <Link
          to={`/roadmap/${analysis.id}`}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-xs font-bold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-glow-brand transition-all hover:scale-[1.02] relative z-10 shrink-0"
        >
          <Route className="w-4 h-4" />
          View 12-Week Roadmap
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Overview & Pillars
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
            activeTab === 'skills'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Skill Gap Matrix ({totalEvaluatedSkills})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
            activeTab === 'audit'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Formula & Audit Log
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition ${
            activeTab === 'evidence'
              ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-glow-brand'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Search className="w-4 h-4" />
          Extracted Evidence
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PILLARS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score Dial */}
            <div className="p-7 rounded-3xl glass-panel flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Compatibility
              </h3>
              <ScoreDial score={analysis.overall_match_score} size={180} strokeWidth={14} label="Match Score" />
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                {analysis.overall_match_score >= 75
                  ? '🎯 Strong alignment! Your profile covers the core requirements. Address minor gaps to maximize shortlist rate.'
                  : analysis.overall_match_score >= 55
                  ? '⚡ Promising candidate! Upskilling in high-priority gaps will significantly increase interview readiness.'
                  : '🚀 Foundation path recommended. Complete the 12-week roadmap to build core competencies for this role.'}
              </p>
            </div>

            {/* Sub-score Pillars */}
            <div className="p-7 rounded-3xl glass-panel flex flex-col justify-between space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Weighted Evaluation Pillars
              </h3>

              <div className="space-y-4">
                {/* Skill Match */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">Skill Alignment (60% weight)</span>
                    <span className="font-metric text-emerald-400 font-bold">{Math.round(analysis.skill_match_score)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      style={{ width: `${analysis.skill_match_score}%` }}
                    />
                  </div>
                </div>

                {/* Experience Match */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">Experience Years (20% weight)</span>
                    <span className="font-metric text-brand-400 font-bold">{Math.round(analysis.experience_match_score)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-brand-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(12,142,232,0.5)]"
                      style={{ width: `${analysis.experience_match_score}%` }}
                    />
                  </div>
                </div>

                {/* Education Match */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">Education Alignment (10% weight)</span>
                    <span className="font-metric text-indigo-400 font-bold">{Math.round(analysis.education_match_score)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      style={{ width: `${analysis.education_match_score}%` }}
                    />
                  </div>
                </div>

                {/* Keyword Match */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-200">Keywords & Context (10% weight)</span>
                    <span className="font-metric text-purple-400 font-bold">{Math.round(analysis.keyword_match_score)}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                      style={{ width: `${analysis.keyword_match_score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Computed transparently with deterministic formula rules.</span>
              </div>
            </div>

            {/* Radar Matrix Chart */}
            <div className="p-7 rounded-3xl glass-panel flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Multi-Dimensional Fit Radar
              </h3>
              <div className="w-full h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1E2A47" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#8A99B5', fontSize: 10, fontWeight: 600 }} />
                    <Radar name="Score" dataKey="score" stroke="#0C8EE8" fill="#0C8EE8" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Summary Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl glass-panel border border-emerald-500/20 bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-2">
                <CheckCircle2 className="w-4 h-4" /> Strong Matches ({matchingSkills.length})
              </div>
              <p className="text-xs text-slate-300">
                You explicitly meet {matchingSkills.length} of the required skills including{' '}
                <span className="text-white font-semibold">
                  {matchingSkills.slice(0, 3).map((s) => s.job_skill).join(', ')}
                </span>
                .
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-brand-500/20 bg-brand-950/20">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase mb-2">
                <Sparkles className="w-4 h-4" /> Semantic Synonyms ({relatedSkills.length})
              </div>
              <p className="text-xs text-slate-300">
                Detected {relatedSkills.length} conceptually related skills using vector similarity and taxonomy aliases.
              </p>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-rose-500/20 bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-2">
                <XCircle className="w-4 h-4" /> Missing Priority Skills ({missingSkills.length})
              </div>
              <p className="text-xs text-slate-300">
                Targeting these {missingSkills.length} skills in your 12-week roadmap will bridge the remaining gap.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILL GAP MATRIX */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSkillFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  skillFilter === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All ({totalEvaluatedSkills})
              </button>
              <button
                onClick={() => setSkillFilter('matched')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  skillFilter === 'matched'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Matched ({matchingSkills.length})
              </button>
              <button
                onClick={() => setSkillFilter('related')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  skillFilter === 'related'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Semantic Synonyms ({relatedSkills.length})
              </button>
              <button
                onClick={() => setSkillFilter('missing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  skillFilter === 'missing'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Missing Gaps ({missingSkills.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching & Related Skills Box */}
            {(skillFilter === 'all' || skillFilter === 'matched' || skillFilter === 'related') && (
              <div className="p-6 rounded-3xl glass-panel space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Fulfilled & Synonymous Skills</span>
                  </div>
                  <span className="text-xs font-metric text-slate-400">
                    {matchingSkills.length + relatedSkills.length} verified
                  </span>
                </div>

                {/* Direct matches */}
                {(skillFilter === 'all' || skillFilter === 'matched') && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Direct Matches ({matchingSkills.length})
                    </span>
                    <div className="space-y-2">
                      {matchingSkills
                        .filter((m) => m.job_skill.toLowerCase().includes(searchSkill.toLowerCase()))
                        .map((m, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <SkillBadge name={m.job_skill} category={m.category} type="matched" />
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                                {m.importance}
                              </span>
                            </div>
                            {m.evidence_resume && (
                              <p className="text-[11px] text-slate-400 italic">
                                Resume Excerpt: "{m.evidence_resume}"
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Semantic matches */}
                {(skillFilter === 'all' || skillFilter === 'related') && relatedSkills.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                      Semantic Synonym Matches ({relatedSkills.length})
                    </span>
                    <div className="space-y-2">
                      {relatedSkills
                        .filter((r) => r.job_skill.toLowerCase().includes(searchSkill.toLowerCase()))
                        .map((r, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/80 border border-brand-500/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <SkillBadge
                                name={r.job_skill}
                                category={r.category}
                                type="related"
                                similarity={r.similarity_score}
                              />
                              <span className="text-[10px] text-brand-300 font-semibold">
                                Matched with '{r.matched_with_resume_skill}'
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300">{r.explanation}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Missing Skills & Gaps Box */}
            {(skillFilter === 'all' || skillFilter === 'missing') && (
              <div className="p-6 rounded-3xl glass-panel space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <XCircle className="w-5 h-5" />
                    <span>Identified Skill Gaps</span>
                  </div>
                  <span className="text-xs font-metric text-slate-400">
                    {missingSkills.length} missing
                  </span>
                </div>

                {missingSkills.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300 space-y-1">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                    <p className="font-bold">No skill gaps detected!</p>
                    <p className="text-slate-400">Your resume meets all target skill requirements.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* High Priority */}
                    {missingSkills.filter((s) => s.priority === 'HIGH').length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                          Critical Requirements (Must Learn)
                        </span>
                        <div className="space-y-2">
                          {missingSkills
                            .filter((s) => s.priority === 'HIGH')
                            .filter((s) => s.skill_name.toLowerCase().includes(searchSkill.toLowerCase()))
                            .map((s, idx) => (
                              <div key={idx} className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                                <SkillBadge
                                  name={s.skill_name}
                                  category={s.category}
                                  type="missing"
                                  priority="HIGH"
                                />
                                <span className="text-[11px] text-rose-300 font-semibold">Priority 1</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Secondary Priority */}
                    {missingSkills.filter((s) => s.priority !== 'HIGH').length > 0 && (
                      <div className="space-y-2.5 pt-3 border-t border-white/10">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                          Preferred / Nice-to-Have Skills
                        </span>
                        <div className="space-y-2">
                          {missingSkills
                            .filter((s) => s.priority !== 'HIGH')
                            .filter((s) => s.skill_name.toLowerCase().includes(searchSkill.toLowerCase()))
                            .map((s, idx) => (
                              <div key={idx} className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                                <SkillBadge
                                  name={s.skill_name}
                                  category={s.category}
                                  type="missing"
                                  priority="MEDIUM"
                                />
                                <span className="text-[11px] text-amber-300 font-semibold">Secondary</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FORMULA & AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-7 rounded-3xl glass-panel space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-400" />
                Deterministic Scoring Formula
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                The overall ATS compatibility score is a deterministic weighted linear combination of four transparent components.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-brand-500/30 font-mono text-xs text-brand-300 space-y-2">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Formula Equation</div>
              <div className="text-sm text-white font-bold">{analysis.score_breakdown?.formula || 'Score = (Skills × 0.60) + (Exp × 0.20) + (Edu × 0.10) + (Keywords × 0.10)'}</div>
              <div className="text-emerald-400 pt-1 border-t border-slate-800">
                Calculated Breakdown: {analysis.score_breakdown?.calculation_audit}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase">1. Skill Alignment (60%)</span>
                  <span className="font-metric text-xs font-bold text-white">{Math.round(analysis.skill_match_score)} pts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.score_breakdown?.explanations?.skill_match || 'Evaluates exact matches and semantic synonym alignments against required and preferred skills.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-400 uppercase">2. Experience Years (20%)</span>
                  <span className="font-metric text-xs font-bold text-white">{Math.round(analysis.experience_match_score)} pts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.score_breakdown?.explanations?.experience_match || 'Compares candidate total detected work experience timeline against stated minimum job requirements.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase">3. Education Degree (10%)</span>
                  <span className="font-metric text-xs font-bold text-white">{Math.round(analysis.education_match_score)} pts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.score_breakdown?.explanations?.education_match || 'Verifies bachelor, master, or doctorate degree level alignment with the position.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase">4. Keyword Overlap (10%)</span>
                  <span className="font-metric text-xs font-bold text-white">{Math.round(analysis.keyword_match_score)} pts</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analysis.score_breakdown?.explanations?.keyword_match || 'Measures contextual vocabulary, terminology, and domain-specific token density.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXTRACTED EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Extracted Resume Data ({resume?.file_name})
            </h3>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 font-mono max-h-96 overflow-y-auto">
              <div>
                <span className="text-slate-500 block">Candidate Name:</span>
                <span className="text-white font-bold">{resume?.parsed_data?.contact?.full_name || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Detected Education:</span>
                {resume?.parsed_data?.education?.map((e, idx) => (
                  <div key={idx} className="text-white">• {e.degree} ({e.institution})</div>
                )) || 'None detected'}
              </div>
              <div>
                <span className="text-slate-500 block">Experience Positions:</span>
                {resume?.parsed_data?.experience?.map((exp, idx) => (
                  <div key={idx} className="text-white">• {exp.title_company} ({exp.date_range || 'N/A'})</div>
                )) || 'None detected'}
              </div>
              <div>
                <span className="text-slate-500 block">Extracted Skill Tags ({resume?.skills?.length || 0}):</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resume?.skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              Target Job Requirements ({job?.title})
            </h3>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 font-mono max-h-96 overflow-y-auto">
              <div>
                <span className="text-slate-500 block">Target Role:</span>
                <span className="text-white font-bold">{job?.title} @ {job?.company || 'Direct'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Required Skills ({job?.skills?.length || 0}):</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job?.skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-brand-300 text-[11px]">
                      {s.skill_name} ({s.importance})
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Required Experience:</span>
                <span className="text-white">{job?.parsed_requirements?.min_experience_years || 0} years required</span>
              </div>
              <div>
                <span className="text-slate-500 block">Original Job Description:</span>
                <p className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans mt-1">
                  {job?.raw_text?.slice(0, 500)}...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

