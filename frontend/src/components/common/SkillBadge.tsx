import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Layers } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  category?: string;
  type?: 'matched' | 'related' | 'missing' | 'neutral';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  similarity?: number;
  evidence?: string;
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  category,
  type = 'neutral',
  priority,
  similarity,
  evidence,
  size = 'md',
}) => {
  const getCategoryTheme = (cat?: string) => {
    if (!cat) return 'text-slate-400 border-slate-700/50';
    const c = cat.toLowerCase();
    if (c.includes('backend') || c.includes('cloud') || c.includes('devops')) return 'text-cyan-300/90 border-cyan-500/20';
    if (c.includes('front') || c.includes('mobile') || c.includes('ui')) return 'text-sky-300/90 border-sky-500/20';
    if (c.includes('ai') || c.includes('data') || c.includes('ml')) return 'text-emerald-300/90 border-emerald-500/20';
    if (c.includes('database') || c.includes('storage')) return 'text-purple-300/90 border-purple-500/20';
    if (c.includes('security') || c.includes('test')) return 'text-amber-300/90 border-amber-500/20';
    return 'text-slate-300/90 border-slate-700/50';
  };

  const getBadgeStyles = () => {
    switch (type) {
      case 'matched':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_12px_-4px_rgba(16,185,129,0.25)]';
      case 'related':
        return 'bg-brand-500/10 text-brand-300 border-brand-500/30 hover:bg-brand-500/20 shadow-[0_0_12px_-4px_rgba(12,142,232,0.25)]';
      case 'missing':
        if (priority === 'HIGH') {
          return 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 shadow-[0_0_12px_-4px_rgba(244,63,94,0.25)]';
        }
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_12px_-4px_rgba(245,158,11,0.25)]';
      default:
        return 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'matched':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'related':
        return <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />;
      case 'missing':
        return priority === 'HIGH' ? (
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        );
      default:
        return null;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl border font-medium transition duration-200 cursor-default group relative ${getBadgeStyles()} ${sizeClasses}`}
      title={evidence || undefined}
    >
      {getIcon()}
      <span className="font-semibold tracking-tight">{name}</span>

      {category && (
        <span className={`text-[10px] font-normal px-1.5 py-0.2 rounded-md bg-slate-900/60 border ${getCategoryTheme(category)}`}>
          {category}
        </span>
      )}

      {priority && type === 'missing' && (
        <span
          className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
            priority === 'HIGH'
              ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40'
              : 'bg-amber-500/25 text-amber-200 border border-amber-500/40'
          }`}
        >
          {priority}
        </span>
      )}

      {similarity !== undefined && similarity > 0 && similarity < 1.0 && (
        <span className="font-metric text-[10px] bg-brand-500/20 text-brand-200 px-1.5 py-0.5 rounded font-bold">
          {Math.round(similarity * 100)}%
        </span>
      )}
    </div>
  );
};

