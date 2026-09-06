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
  const [showAuditLog, setShowAuditLog] = useState(false);

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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            AI Compatibility & Skill Gap Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {job?.title || 'Job Compatibility'}
          </h1>
          <p className="text-xs text-slate-300">
            Target Company: <span className="text-brand-300 font-semibold">{job?.company || 'Specified Target'}</span> •
            Matched with: <span className="text-white font-medium">{resume?.file_name}</span>
          </p>
        </div>

        <Link
          to={`/roadmap/${analysis.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-semibold bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-90 shadow-glow-brand transition"
        >
          <Route className="w-4 h-4" />
          View Personalized Roadmap
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Score & Radar Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Dial */}
        <div className="p-6 rounded-3xl glass-panel flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Overall Compatibility
          </h3>
          <ScoreDial score={analysis.overall_match_score} size={170} strokeWidth={14} label="Match Score" />
          <div className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {analysis.overall_match_score >= 75
              ? 'Strong alignment! Your background closely matches the core technical requirements.'
              : analysis.overall_match_score >= 55
              ? 'Moderate alignment. Closing a few high-priority skill gaps will dramatically boost candidate suitability.'
              : 'Growth pathway recommended. Follow the generated learning roadmap to bridge key gaps.'}
          </div>
        </div>

        {/* Sub-score Pillars */}
        <div className="p-6 rounded-3xl glass-panel flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Evaluation Pillars
          </h3>

          <div className="space-y-3">
            {/* Skill Match */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Skill Alignment (60% weight)</span>
                <span className="text-brand-400 font-bold">{Math.round(analysis.skill_match_score)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.skill_match_score}%` }}
                />
              </div>
            </div>

            {/* Experience Match */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Experience Alignment (20% weight)</span>
                <span className="text-indigo-400 font-bold">{Math.round(analysis.experience_match_score)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.experience_match_score}%` }}
                />
              </div>
            </div>

            {/* Education Match */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Education Alignment (10% weight)</span>
                <span className="text-purple-400 font-bold">{Math.round(analysis.education_match_score)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.education_match_score}%` }}
                />
              </div>
            </div>

            {/* Keyword Match */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Keyword / Scope Overlap (10% weight)</span>
                <span className="text-emerald-400 font-bold">{Math.round(analysis.keyword_match_score)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${analysis.keyword_match_score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-400" />
            <span>Weights are configurable in settings.</span>
          </div>
        </div>

        {/* Radar Matrix Chart */}
        <div className="p-6 rounded-3xl glass-panel flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Multi-Dimensional Radar
          </h3>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1F293D" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#0C8EE8" fill="#0C8EE8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent Formula Audit Log Accordion */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <button
          onClick={() => setShowAuditLog(!showAuditLog)}
          className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-400" />
            <span>Transparent Mathematical Audit Log</span>
          </div>
          {showAuditLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAuditLog && (
          <div className="space-y-3 pt-3 border-t border-slate-800 font-mono text-xs animate-fade-in">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <p className="text-brand-300">
                Formula: {analysis.score_breakdown?.formula}
              </p>
              <p className="text-emerald-400 font-bold">
                Calculated: {analysis.score_breakdown?.calculation_audit}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block font-semibold">Skill Rationale:</span>
                <span className="text-slate-300">{analysis.score_breakdown?.explanations?.skill_match}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block font-semibold">Experience Rationale:</span>
                <span className="text-slate-300">{analysis.score_breakdown?.explanations?.experience_match}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills Analysis Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched & Related Skills */}
        <div className="p-6 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Matching & Related Skills ({matchingSkills.length + relatedSkills.length})</span>
          </div>

          {/* Exact Matches */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Strong Exact Matches ({matchingSkills.length})
            </span>
            <div className="space-y-2">
              {matchingSkills.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <SkillBadge name={m.job_skill} category={m.category} type="matched" />
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      {m.importance}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Evidence: "{m.evidence_resume}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related / Semantic Matches */}
          {relatedSkills.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                Related Conceptual Skills ({relatedSkills.length})
              </span>
              <div className="space-y-2">
                {relatedSkills.map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-indigo-950/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <SkillBadge
                        name={r.job_skill}
                        category={r.category}
                        type="related"
                        similarity={r.similarity_score}
                      />
                      <span className="text-[10px] text-indigo-400 font-medium">
                        Aligned with '{r.matched_with_resume_skill}'
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{r.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Missing Skills & Gaps */}
        <div className="p-6 rounded-3xl glass-panel space-y-5">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <XCircle className="w-5 h-5" />
            <span>Identified Skill Gaps ({missingSkills.length})</span>
          </div>

          {missingSkills.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-300">
              No critical skill gaps detected! Your resume fulfills all listed requirements.
            </div>
          ) : (
            <div className="space-y-3">
              {/* High Priority */}
              {missingSkills.filter((s) => s.priority === 'HIGH').length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                    High Priority (Required Core Gaps)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills
                      .filter((s) => s.priority === 'HIGH')
                      .map((s, idx) => (
                        <SkillBadge
                          key={idx}
                          name={s.skill_name}
                          category={s.category}
                          type="missing"
                          priority="HIGH"
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Medium & Low Priority */}
              {missingSkills.filter((s) => s.priority !== 'HIGH').length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Secondary / Preferred Gaps
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills
                      .filter((s) => s.priority !== 'HIGH')
                      .map((s, idx) => (
                        <SkillBadge
                          key={idx}
                          name={s.skill_name}
                          category={s.category}
                          type="missing"
                          priority="MEDIUM"
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-4 border-t border-slate-800">
            <Link
              to={`/roadmap/${analysis.id}`}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Route className="w-4 h-4 text-brand-400" />
              Generate Roadmap for Missing Skills →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
