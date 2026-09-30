import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LearningRoadmap, RoadmapItem } from '../types';
import {
  Route,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  Code2,
  Sparkles,
  ArrowLeft,
  Circle,
  Calendar,
  Layers,
  Award,
  Check,
  Zap,
  Bookmark,
  Share2,
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const fetchRoadmap = async () => {
    if (!analysisId) return;
    try {
      let data: LearningRoadmap;
      try {
        data = await api.getRoadmap(analysisId);
      } catch (e) {
        data = await api.generateRoadmap(analysisId, 12);
      }
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [analysisId]);

  const handleToggleStatus = async (item: RoadmapItem) => {
    setUpdatingItemId(item.id);
    let nextStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS';
    if (item.status === 'NOT_STARTED') nextStatus = 'IN_PROGRESS';
    else if (item.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (item.status === 'COMPLETED') nextStatus = 'NOT_STARTED';

    try {
      const updated = await api.updateRoadmapItemStatus(item.id, nextStatus);
      if (roadmap) {
        setRoadmap({
          ...roadmap,
          items: roadmap.items.map((i) => (i.id === item.id ? updated : i)),
        });
      }
    } catch (err) {
      alert('Failed to update stage status.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const toggleTopicCheck = (topicKey: string) => {
    setCheckedTopics((prev) => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  if (loading || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Generating your personalized 12-week upskilling syllabus...</p>
      </div>
    );
  }

  const completedCount = roadmap.items.filter((i) => i.status === 'COMPLETED').length;
  const inProgressCount = roadmap.items.filter((i) => i.status === 'IN_PROGRESS').length;
  const progressPct = Math.round((completedCount / (roadmap.items.length || 1)) * 100);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/analysis/${analysisId}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis Evaluation
        </Link>
      </div>

      {/* Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow space-y-5 relative overflow-hidden">
        <div className="ambient-glow top-0 right-0 w-72 h-72 bg-brand-500/15 pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Personalized Skill-Development Pathway
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {roadmap.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-2">
            {roadmap.summary}
          </p>
        </div>

        {/* High-level stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Duration</span>
            <span className="font-metric text-lg font-bold text-white">12 Weeks</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Time / Wk</span>
            <span className="font-metric text-lg font-bold text-brand-400">8 - 10 Hours</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">In Progress</span>
            <span className="font-metric text-lg font-bold text-amber-400">{inProgressCount} Stages</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
            <span className="font-metric text-lg font-bold text-emerald-400">{completedCount} Stages</span>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
            <span>Overall Roadmap Completion</span>
            <span className="font-metric text-emerald-400">{progressPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 h-3 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Timeline Stages */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-800">
        {roadmap.items.map((stage, sIdx) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isInProgress = stage.status === 'IN_PROGRESS';

          return (
            <div key={stage.id} className="relative pl-14 group">
              {/* Timeline Indicator Dot */}
              <button
                onClick={() => handleToggleStatus(stage)}
                disabled={updatingItemId === stage.id}
                title="Click to toggle stage status"
                className={`absolute left-3 top-6 -translate-x-1/2 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-glow-emerald'
                    : isInProgress
                    ? 'bg-brand-500/20 border-brand-400 text-brand-400 shadow-glow-brand animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isInProgress ? (
                  <Clock className="w-4.5 h-4.5" />
                ) : (
                  <Circle className="w-4.5 h-4.5" />
                )}
              </button>

              {/* Stage Card */}
              <div
                className={`p-6 sm:p-7 rounded-3xl glass-panel space-y-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/15'
                    : isInProgress
                    ? 'border-brand-500/40 bg-brand-950/15'
                    : 'border-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Stage {sIdx + 1} • Focus Phase
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                      {stage.stage_title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(stage)}
                    className={`self-start sm:self-auto text-[11px] uppercase font-bold px-3 py-1.5 rounded-xl border transition ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : isInProgress
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {stage.status.replace('_', ' ')}
                  </button>
                </div>

                {/* Topics with Interactive Checkboxes */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Core Milestone Checkpoints
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stage.topics.map((topic, tIdx) => {
                      const topicKey = `${stage.id}-${tIdx}`;
                      const isChecked = checkedTopics[topicKey] || isCompleted;

                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTopicCheck(topicKey)}
                          className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition select-none ${
                            isChecked
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 transition ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-600 bg-slate-800'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={isChecked ? 'line-through opacity-80' : ''}>{topic}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Practical Capstone Project */}
                {stage.project_suggestion && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>Hands-On Capstone Project Deliverable</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {stage.project_suggestion}
                    </p>
                  </div>
                )}

                {/* Recommended Resources */}
                {stage.recommended_resources && stage.recommended_resources.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Curated Documentation & Free Guides
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stage.recommended_resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 flex items-center justify-between text-xs text-slate-300 hover:text-brand-300 transition group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
                            <span className="truncate font-semibold">{res.title}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

