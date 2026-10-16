import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface BusinessTrustScoreProps {
  score: number;
  hasScore: boolean;
}

export function BusinessTrustScore({ score, hasScore }: BusinessTrustScoreProps) {
  const normalizedScore = Math.min(100, Math.max(0, score));
  
  const scoreBadge = !hasScore
    ? { color: '#94a3b8', bg: 'bg-slate-500/10', text: 'text-slate-500', label: 'Unrated' }
    : normalizedScore >= 70
      ? { color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'High Trust' }
      : normalizedScore >= 40
        ? { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Moderate' }
        : { color: '#ef4444', bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'High Risk' };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card to-card/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        
        {/* Modern Circular Meter */}
        <div
          className="relative size-32 shrink-0 rounded-full p-2.5 transition-all shadow-inner"
          style={{
            background: hasScore
              ? `conic-gradient(${scoreBadge.color} 0deg ${normalizedScore * 3.6}deg, var(--muted) ${normalizedScore * 3.6}deg 360deg)`
              : 'conic-gradient(var(--muted) 0deg 360deg)',
          }}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-card shadow-sm border border-border/40">
            <span className="text-3xl font-black tracking-tight" style={{ color: scoreBadge.color }}>
              {hasScore ? normalizedScore : '—'}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Score
            </span>
          </div>
        </div>

        {/* Score Context */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-base font-bold text-foreground">TrustPass Rating</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadge.bg} ${scoreBadge.text}`}>
              {scoreBadge.label}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {hasScore
              ? 'Computed transparently based on verification criteria, consumer feedback, resolution rate, and activity history.'
              : 'No trust evaluation has been finalized for this business yet.'}
          </p>

          {/* Scale Legend */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" /> 0-39 Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" /> 40-69 Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" /> 70-100 High
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}