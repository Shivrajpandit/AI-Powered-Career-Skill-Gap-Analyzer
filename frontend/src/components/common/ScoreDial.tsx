import React from 'react';

interface ScoreDialProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ScoreDial: React.FC<ScoreDialProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label = 'Match Score',
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return '#10B981'; // Emerald
    if (s >= 55) return '#3B82F6'; // Blue
    if (s >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Rose
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1F293D"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {Math.round(clampedScore)}%
        </span>
        <span className="text-[11px] font-medium text-slate-400 mt-0.5">{label}</span>
      </div>
      {sublabel && (
        <span className="text-xs text-slate-400 mt-2 font-medium">{sublabel}</span>
      )}
    </div>
  );
};
