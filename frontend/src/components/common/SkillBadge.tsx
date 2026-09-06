import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  category?: string;
  type?: 'matched' | 'related' | 'missing' | 'neutral';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  similarity?: number;
  evidence?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  category,
  type = 'neutral',
  priority,
  similarity,
  evidence,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'matched':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20';
      case 'related':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20';
      case 'missing':
        if (priority === 'HIGH') {
          return 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20';
        }
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'matched':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'related':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'missing':
        return priority === 'HIGH' ? (
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-default group relative ${getStyles()}`}
      title={evidence || undefined}
    >
      {getIcon()}
      <span>{name}</span>
      {category && (
        <span className="text-[10px] opacity-60 font-normal">({category})</span>
      )}
      {priority && type === 'missing' && (
        <span
          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
            priority === 'HIGH'
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {priority}
        </span>
      )}
      {similarity && similarity < 1.0 && (
        <span className="text-[10px] text-indigo-300 font-semibold">
          {Math.round(similarity * 100)}%
        </span>
      )}
    </div>
  );
};
