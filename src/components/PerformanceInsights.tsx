import React from 'react';
import { AlertTriangle, Star, Zap, BarChart2, Target } from 'lucide-react';
import { useSAT } from '../context/SATContext';

function InsightCard({
  icon: Icon,
  iconBg,
  label,
  value,
  detail,
  className = '',
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`p-4 rounded-xl border border-[#e5e9f0] dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400 mb-0.5 truncate">
            {label}
          </div>
          <div className="text-base font-extrabold text-[#182235] dark:text-slate-100 leading-snug">
            {value}
          </div>
          <div className="text-xs text-[#6f7b90] dark:text-slate-400 leading-relaxed mt-1">
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionInsightsCard({
  sectionLabel,
  sectionKey,
}: {
  sectionLabel: string;
  sectionKey: 'rw' | 'math';
}) {
  const { domainTrends } = useSAT();

  const sectionDomains = domainTrends.filter(
    dt => dt.domain.section === sectionKey && dt.latestScore != null
  );

  if (sectionDomains.length === 0) return null;

  const strongest = [...sectionDomains].sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0))[0];
  const weakest = [...sectionDomains].sort((a, b) => (a.latestScore ?? 999) - (b.latestScore ?? 999))[0];
  const sameItem = strongest?.domain.id === weakest?.domain.id;

  return (
    <div className="rounded-xl border border-[#e5e9f0] dark:border-slate-800 overflow-hidden bg-[#fafbfc] dark:bg-slate-800/40 flex flex-col">
      <div className="px-4 py-2.5 bg-[#f6f8fb] dark:bg-slate-800/80 border-b border-[#f0f2f5] dark:border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#405978] dark:text-indigo-400">
          {sectionLabel} Breakdown
        </span>
      </div>

      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
        {strongest && (
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400 mb-0.5">
                Strongest Domain
              </div>
              <div className="text-sm font-extrabold text-[#182235] dark:text-slate-100">
                {strongest.domain.name}
              </div>
              <div className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
                Score: <strong className="text-[#182235] dark:text-slate-200">{strongest.latestScore}</strong>
                {strongest.averageScore ? ` · avg ${strongest.averageScore}` : ''}
                {strongest.latestPct != null ? ` · ${strongest.latestPct}% correct` : ''}
              </div>
            </div>
          </div>
        )}

        {weakest && !sameItem && (
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400 mb-0.5">
                Priority Area
              </div>
              <div className="text-sm font-extrabold text-[#182235] dark:text-slate-100">
                {weakest.domain.name}
              </div>
              <div className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
                Score: <strong className="text-[#182235] dark:text-slate-200">{weakest.latestScore}</strong>
                {weakest.latestPct != null ? ` · ${weakest.latestPct}% correct` : ''} — Highest point gain opportunity.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressToGoal({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const needed = Math.max(0, target - current);
  const reached = current >= target;

  return (
    <div className="p-4 bg-[#f8fafc] dark:bg-slate-800/40 rounded-xl border border-[#e5e9f0] dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400">
          Progress to Target Score
        </div>
        <div className={`text-xs font-black ${reached ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#2c4160] dark:text-indigo-400'}`}>
          {current} / {target}
        </div>
      </div>
      <div className="w-full h-2.5 bg-[#eef1f5] dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            reached ? 'bg-emerald-500' : 'bg-[#2c4160] dark:bg-indigo-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-[#6f7b90] dark:text-slate-400 mt-2 flex items-center justify-between">
        <span>
          {reached
            ? 'Goal reached! Consider raising your target.'
            : `${needed} more points needed to hit target (${pct}% achieved)`}
        </span>
      </div>
    </div>
  );
}

export const PerformanceInsights: React.FC = () => {
  const { domainTrends, tests, latestTest, averageScore, superscore, targetScore } = useSAT();

  const domainWithData = domainTrends.filter(dt => dt.latestScore != null);
  const mostImproved = [...domainWithData]
    .filter(dt => dt.delta !== null)
    .sort((a, b) => (b.delta ?? -999) - (a.delta ?? -999))[0];

  const hasInsights = domainWithData.length > 0 || tests.length > 0;
  const hasSectionData = domainWithData.length > 0;

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-[#f0f2f5] dark:border-slate-800 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100">Performance Insights</h2>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            Automated strengths, priority focus domains, and score trajectory.
          </p>
        </div>
        {latestTest && (
          <div className="text-xs text-[#6f7b90] dark:text-slate-400 bg-[#f6f8fb] dark:bg-slate-800/80 px-3 py-1 rounded-full border border-[#e5e9f0] dark:border-slate-700 font-medium">
            Based on {latestTest.name || 'Latest Test'} ({latestTest.total})
          </div>
        )}
      </div>

      {!hasInsights ? (
        <div className="p-8 text-sm text-[#6f7b90] dark:text-slate-400 text-center">
          Add at least one test to generate performance insights.
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {latestTest && targetScore && (
            <ProgressToGoal current={latestTest.total} target={targetScore} />
          )}

          {hasSectionData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionInsightsCard sectionLabel="Reading & Writing" sectionKey="rw" />
              <SectionInsightsCard sectionLabel="Math" sectionKey="math" />
            </div>
          ) : latestTest ? (
            <div className="p-4 rounded-xl border border-[#e5e9f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/40">
              <InsightCard
                icon={BarChart2}
                iconBg="bg-[#eef2f7] dark:bg-slate-800 text-[#405978] dark:text-slate-300"
                label="Domain Breakdown"
                value="Domain data not yet recorded"
                detail="Click 'Edit' or add domain details when logging tests to unlock section-by-section strength & weakness analysis."
              />
            </div>
          ) : null}

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {superscore && (
              <InsightCard
                icon={Target}
                iconBg="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                label="Superscore"
                value={`${superscore.total}`}
                detail={`Best R&W ${superscore.rw} + Best Math ${superscore.math} across all tests.`}
              />
            )}

            {averageScore && (
              <InsightCard
                icon={BarChart2}
                iconBg="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                label="Average Score"
                value={`${averageScore}`}
                detail={`Mean total score across all ${tests.length} recorded test${tests.length === 1 ? '' : 's'}.`}
              />
            )}

            {mostImproved && (mostImproved.delta ?? 0) > 0 ? (
              <InsightCard
                icon={Zap}
                iconBg="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                label="Largest Recent Gain"
                value={mostImproved.domain.name}
                detail={`+${mostImproved.delta} points from previous recorded domain score.`}
              />
            ) : (
              <InsightCard
                icon={Zap}
                iconBg="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                label="Trajectory"
                value={tests.length > 1 ? `${tests.length} Tests Logged` : 'Baseline Established'}
                detail={tests.length > 1 ? 'Continuous testing leads to predictable score improvement.' : 'Add your next practice test to reveal score deltas.'}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
