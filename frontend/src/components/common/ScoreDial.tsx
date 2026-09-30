import React from 'react';

interface ScoreDialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showBadge?: boolean;
}

export const ScoreDial: React.FC<ScoreDialProps> = ({
  score,
  size = 150,
  strokeWidth = 12,
  label = 'Match Score',
  sublabel,
  showBadge = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getTier = (s: number) => {
    if (s >= 80) return { label: 'Strong Fit', color: '#10B981', gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.3)', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (s >= 65) return { label: 'Good Match', color: '#0C8EE8', gradient: 'from-brand-500 to-cyan-400', glow: 'rgba(12, 142, 232, 0.3)', bg: 'bg-brand-500/10 text-brand-300 border-brand-500/20' };
    if (s >= 45) return { label: 'Moderate Fit', color: '#F59E0B', gradient: 'from-amber-500 to-yellow-400', glow: 'rgba(245, 158, 11, 0.3)', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    return { label: 'Needs Upskilling', color: '#F43F5E', gradient: 'from-rose-500 to-pink-500', glow: 'rgba(244, 63, 94, 0.3)', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
  };

  const tier = getTier(clampedScore);
  const gradientId = `score-dial-gradient-${Math.round(score)}-${size}`;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative flex items-center justify-center">
        {/* Glow Aura */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-700 pointer-events-none"
          style={{ background: tier.glow }}
        />

        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-md">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={clampedScore >= 65 ? '#0C8EE8' : tier.color} />
              <stop offset="100%" stopColor={tier.color} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#162035"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s ease',
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-metric text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {clampedScore}
            <span className="text-sm font-semibold text-slate-400 ml-0.5">%</span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {showBadge && (
        <div className={`mt-3 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide ${tier.bg}`}>
          {tier.label}
        </div>
      )}

      {sublabel && (
        <span className="text-xs text-slate-400 mt-1.5 font-medium">{sublabel}</span>
      )}
    </div>
  );
};

