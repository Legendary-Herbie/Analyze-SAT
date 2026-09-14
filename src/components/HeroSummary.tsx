import React, { useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Target, BookOpen, Calculator, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
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
    <div className="bg-white/10 border border-white/10 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col gap-0.5 sm:gap-1">
      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-wider truncate">
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="text-base sm:text-xl font-black text-white leading-tight">{value}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-white/60 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

export const HeroSummary: React.FC<{
  onOpenGoalPlanner?: () => void;
  onOpenAddModal?: () => void;
}> = ({ onOpenGoalPlanner, onOpenAddModal }) => {
  const { latestTest, previousTest, personalBest, superscore, scoreDelta, targetScore, tests, resetToSample } = useSAT();

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

  // Target calculation based on most recent test
  const latestScore = latestTest?.total ?? 0;
  const isGoalMet = latestScore >= targetScore && latestScore > 0;
  const pointsNeeded = Math.max(0, targetScore - latestScore);
  const pointsExceeded = Math.max(0, latestScore - targetScore);
  const progressPct = targetScore > 0 && latestScore > 0
    ? Math.min(100, Math.round((latestScore / targetScore) * 100))
    : 0;

  // Confetti effect trigger
  const lastTriggeredKey = useRef<string | null>(null);

  const triggerConfetti = useCallback(() => {
    try {
      // Center celebratory burst
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#38bdf8', '#fbbf24', '#a855f7'],
        disableForReducedMotion: true,
      });

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.7 },
          colors: ['#34d399', '#818cf8', '#fbbf24'],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.7 },
          colors: ['#34d399', '#818cf8', '#fbbf24'],
          disableForReducedMotion: true,
        });
      }, 200);
    } catch (e) {
      console.error('Failed to trigger confetti animation', e);
    }
  }, []);

  // Automatically trigger confetti when target score is achieved or surpassed
  useEffect(() => {
    if (isGoalMet && latestTest) {
      const triggerKey = `${latestTest.id}-${latestScore}-${targetScore}`;
      if (lastTriggeredKey.current !== triggerKey) {
        lastTriggeredKey.current = triggerKey;
        const timer = setTimeout(() => {
          triggerConfetti();
        }, 450);
        return () => clearTimeout(timer);
      }
    }
  }, [isGoalMet, latestTest, latestScore, targetScore, triggerConfetti]);

  return (
    <section
      className="rounded-xl sm:rounded-2xl p-3.5 sm:p-6 mb-3.5 sm:mb-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a2636 0%, #2c4160 50%, #3a5373 100%)', boxShadow: '0 20px 40px rgba(26,38,54,0.18)' }}
    >
      {/* Background decoration */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
      <div className="absolute right-20 -bottom-8 w-32 h-32 rounded-full bg-white/[0.03] pointer-events-none" />

      <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap relative">
        <div>
          <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-white/60 mb-0.5 sm:mb-1">
            Latest Score
          </div>
          <div className="text-2xl sm:text-[38px] font-black text-white leading-none tracking-tight">
            {latestTest ? latestTest.total : '—'}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-xs sm:text-sm text-white/60">
              {latestTest
                ? `${latestTest.name} · ${formatDate(latestTest.date)}`
                : 'Add your first practice test'}
            </span>
            {latestTest?.source && (
              <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70 font-semibold">
                {latestTest.source}
              </span>
            )}
          </div>
          {scoreDelta !== null && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              <DeltaBadge delta={scoreDelta} />
              <span className="text-[10px] sm:text-xs text-white/50">from previous test</span>
            </div>
          )}
        </div>

        <div className={`text-[11px] sm:text-xs font-extrabold px-2.5 sm:px-3.5 py-1 sm:py-2 rounded-full border ${getTrendColor()} self-start mt-0.5 sm:mt-1`}>
          {getTrendText()}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3.5 sm:mt-6">
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

      {/* Visual Target Score Progress Bar based on most recent practice test */}
      <div className="mt-3.5 sm:mt-5 p-3 sm:p-4 rounded-xl bg-white/[0.08] border border-white/15 backdrop-blur-xs">
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap mb-2 sm:mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                  Target Score Progress
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-white/15 text-white/90">
                  {latestTest ? latestTest.name : 'No test yet'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <span className="text-xs sm:text-sm font-black text-white">
                {latestScore > 0 ? latestScore : '—'}{' '}
                <span className="text-[10px] sm:text-xs font-normal text-white/60">/ {targetScore}</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black text-amber-300 ml-1.5 sm:ml-2">
                {progressPct}%
              </span>
            </div>
            {onOpenGoalPlanner && (
              <button
                type="button"
                onClick={onOpenGoalPlanner}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-95"
                title="Customize your target composite score and view score pathways"
              >
                <span>Adjust Goal</span>
                <ChevronRight className="w-3 h-3 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* The Visual Progress Track */}
        <div className="relative w-full h-2.5 sm:h-3.5 bg-black/35 rounded-full overflow-hidden p-0.5 border border-white/15 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGoalMet
                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.6)]'
                : progressPct >= 90
                ? 'bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(129,140,248,0.5)]'
                : 'bg-gradient-to-r from-blue-500 via-indigo-400 to-amber-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
            }`}
            style={{ width: `${progressPct}%` }}
          />

          {/* Sub-milestone markers */}
          <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-30">
            <div className="w-px h-full bg-white/40" />
            <div className="w-px h-full bg-white/40" />
            <div className="w-px h-full bg-white/40" />
          </div>
        </div>

        {/* Progress details & breakdown */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/75 mt-2 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            {isGoalMet ? (
              <button
                type="button"
                onClick={triggerConfetti}
                className="inline-flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-emerald-400/30 transition-all cursor-pointer active:scale-95 shadow-xs group"
                title="Goal met! Click to celebrate with confetti"
              >
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>Target achieved! Exceeded by +{pointsExceeded} pts.</span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white group-hover:bg-white/30 transition-colors">
                  🎉 Celebrate
                </span>
              </button>
            ) : latestScore > 0 ? (
              <span>
                <strong className="text-white font-extrabold">{pointsNeeded} pts</strong> needed to reach target {targetScore}.
              </span>
            ) : (
              <span>Log a test to see your score progress toward {targetScore}.</span>
            )}
          </div>

          {latestTest && (
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/70">
              <span>R&W: <strong className="text-white font-bold">{latestTest.rw}</strong>/800</span>
              <span className="text-white/40">•</span>
              <span>Math: <strong className="text-white font-bold">{latestTest.math}</strong>/800</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State Onboarding Callout */}
      {tests.length === 0 && (
        <div className="mt-3.5 sm:mt-5 p-3.5 sm:p-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span>Get Started with Your Practice Tracker</span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 sm:mt-1 max-w-xl leading-normal sm:leading-relaxed">
              Your tracker starts empty. Log your practice test scores to chart your personal journey, or load <strong>4 sample Bluebook tests</strong> to preview score jumps, plateau triage, and adaptive routing analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={resetToSample}
              className="w-full sm:w-auto justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black text-[#182235] bg-amber-300 hover:bg-amber-200 rounded-lg sm:rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-900" />
              <span>Load 4 Sample Tests</span>
            </button>
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="w-full sm:w-auto justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-95"
              >
                + Add Practice Test
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

