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
} from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const fetchRoadmap = async () => {
    if (!analysisId) return;
    try {
      let data: LearningRoadmap;
      try {
        data = await api.getRoadmap(analysisId);
      } catch (e) {
        // If not generated yet, generate on the fly
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

  if (loading || !roadmap) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedCount = roadmap.items.filter((i) => i.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / (roadmap.items.length || 1)) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/analysis/${analysisId}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analysis Report
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Personalized Skill-Development Pathway
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {roadmap.title}
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{roadmap.summary}</p>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Overall Roadmap Progress</span>
            <span className="text-brand-400 font-bold">{progressPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Timeline Stages */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-800">
        {roadmap.items.map((stage) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isInProgress = stage.status === 'IN_PROGRESS';

          return (
            <div key={stage.id} className="relative pl-14 group">
              {/* Timeline Indicator Dot */}
              <button
                onClick={() => handleToggleStatus(stage)}
                disabled={updatingItemId === stage.id}
                title="Click to toggle status"
                className={`absolute left-3 top-6 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-glow-emerald'
                    : isInProgress
                    ? 'bg-brand-500/20 border-brand-400 text-brand-400 shadow-glow-brand animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-600 hover:border-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isInProgress ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>

              {/* Stage Card */}
              <div
                className={`p-6 rounded-3xl glass-panel space-y-4 border transition ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : isInProgress
                    ? 'border-brand-500/40 bg-brand-950/10'
                    : 'border-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {stage.stage_title}
                  </h3>
                  <button
                    onClick={() => handleToggleStatus(stage)}
                    className={`self-start text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border transition ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : isInProgress
                        ? 'bg-brand-500/10 text-brand-300 border-brand-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Status: {stage.status.replace('_', ' ')}
                  </button>
                </div>

                {/* Topics Covered */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Core Focus Topics
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {stage.topics.map((topic, tIdx) => (
                      <li key={tIdx}>{topic}</li>
                    ))}
                  </ul>
                </div>

                {/* Practical Capstone Project */}
                {stage.project_suggestion && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>Hands-On Project Deliverable</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {stage.project_suggestion}
                    </p>
                  </div>
                )}

                {/* Recommended Resources */}
                {stage.recommended_resources && stage.recommended_resources.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Recommended Learning Resources
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stage.recommended_resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 hover:text-brand-300 transition group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookOpen className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                            <span className="truncate">{res.title}</span>
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
