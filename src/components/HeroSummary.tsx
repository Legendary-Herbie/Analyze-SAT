import React from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Target, BookOpen, Calculator } from 'lucide-react';
import { useSAT } from '../context/SATContext';

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const positive = delta > 0;
  const neutral = delta === 0;
  const Icon = positive ? TrendingUp : neutral ? Minus : TrendingDown;
  const colorClass = positive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : neutral
    ? 'bg-gray-50 text-gray-500 border-gray-200'
    : 'bg-red-50 text-red-600 border-red-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border rounded-full ${colorClass}`}>
      <Icon className="w-3 h-3" />
      {positive ? '+' : ''}{delta}
    </span>
  );
}

function StatCard({
  label, value, sub, icon: Icon
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-[22px] font-black text-white leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-white/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export const HeroSummary: React.FC = () => {
  const { latestTest, previousTest, personalBest, superscore, scoreDelta } = useSAT();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date not set';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTrendText = () => {
    if (scoreDelta === null) return latestTest ? 'First test recorded' : 'No tests yet';
    if (scoreDelta > 15) return `↑ Improving`;
    if (scoreDelta < -15) return `↓ Declining`;
    return `→ Stable`;
  };

  const getTrendColor = () => {
    if (scoreDelta === null) return 'bg-white/10 border-white/10 text-white/80';
    if (scoreDelta > 15) return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200';
    if (scoreDelta < -15) return 'bg-red-500/20 border-red-400/30 text-red-200';
    return 'bg-white/10 border-white/10 text-white/70';
  };

  return (
    <section
      className="rounded-2xl p-6 mb-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a2636 0%, #2c4160 50%, #3a5373 100%)', boxShadow: '0 20px 40px rgba(26,38,54,0.18)' }}
    >
      {/* Background decoration */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute right-20 -bottom-8 w-32 h-32 rounded-full bg-white/[0.03] pointer-events-none" />

      <div className="flex items-start justify-between gap-4 flex-wrap relative">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/60 mb-1">
            Latest Score
          </div>
          <div className="text-[52px] sm:text-[62px] font-black text-white leading-none tracking-tight">
            {latestTest ? latestTest.total : '—'}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-sm text-white/60">
              {latestTest
                ? `${latestTest.name} · ${formatDate(latestTest.date)}`
                : 'Add your first practice test'}
            </span>
            {latestTest?.source && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70 font-semibold">
                {latestTest.source}
              </span>
            )}
          </div>
          {scoreDelta !== null && (
            <div className="flex items-center gap-2 mt-2">
              <DeltaBadge delta={scoreDelta} />
              <span className="text-xs text-white/50">from previous test</span>
            </div>
          )}
        </div>

        <div className={`text-xs font-extrabold px-3.5 py-2 rounded-full border ${getTrendColor()} self-start mt-1`}>
          {getTrendText()}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <StatCard
          label="Reading & Writing"
          value={latestTest?.rw ?? '—'}
          sub={previousTest ? <DeltaBadge delta={(latestTest?.rw ?? 0) - previousTest.rw} /> : null}
          icon={BookOpen}
        />
        <StatCard
          label="Math"
          value={latestTest?.math ?? '—'}
          sub={previousTest ? <DeltaBadge delta={(latestTest?.math ?? 0) - previousTest.math} /> : null}
          icon={Calculator}
        />
        <StatCard
          label="Personal Best"
          value={personalBest ?? '—'}
          sub={personalBest && latestTest && latestTest.total === personalBest ? '🏆 Current test!' : undefined}
          icon={Award}
        />
        <StatCard
          label="Superscore"
          value={superscore?.total ?? '—'}
          sub={superscore ? `R&W ${superscore.rw} + Math ${superscore.math}` : 'Not enough data'}
          icon={Target}
        />
      </div>
    </section>
  );
};
