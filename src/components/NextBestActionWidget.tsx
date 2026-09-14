import React from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { useSAT } from '../context/SATContext';

interface NextBestActionWidgetProps {
  onNavigateTab: (tab: string) => void;
  onOpenGoalPlanner?: () => void;
}

export const NextBestActionWidget: React.FC<NextBestActionWidgetProps> = ({
  onNavigateTab,
}) => {
  const { latestTest, superscore, targetScore, domainTrends, orderedTests } = useSAT();

  const currentScore = latestTest?.total ?? (superscore?.total ?? 0);
  const scoreGap = Math.max(0, targetScore - currentScore);

  // Identify lowest performing or priority domain
  const scoredDomains = domainTrends.filter(d => d.latestScore != null || d.latestPct != null);
  const weakestDomain = [...(scoredDomains.length > 0 ? scoredDomains : domainTrends)].sort((a, b) => {
    const scoreA = a.latestScore ?? 650;
    const scoreB = b.latestScore ?? 650;
    if (scoreA !== scoreB) return scoreA - scoreB;
    const pctA = a.latestPct ?? 70;
    const pctB = b.latestPct ?? 70;
    return pctA - pctB;
  })[0];

  // Check if student was routed to easy Module 2 on latest test
  const hasEasyM2 =
    latestTest?.moduleRouting?.rwModule2Difficulty === 'easy' ||
    latestTest?.moduleRouting?.mathModule2Difficulty === 'easy';

  // Has mistake log entries in latest test?
  const recentMistakesCount = latestTest?.mistakes?.length ?? 0;

  // Determine primary high-leverage action
  let actionTitle = 'Review Weakest Domain';
  let actionDescription = weakestDomain
    ? `Your lowest scoring area is ${weakestDomain.domain.name} (${weakestDomain.latestScore ? `${weakestDomain.latestScore} score` : `${weakestDomain.latestPct}% accuracy`}). Focus on targeted drills here to unlock +30-50 pts.`
    : 'Log your first official or Bluebook test to generate precision recommendations.';
  let actionBadge = 'High Leverage';
  let actionBadgeColor = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  let ctaText = 'View Domain Drill';
  let ctaTarget = 'domains';

  if (orderedTests.length === 0) {
    actionTitle = 'Record Your Baseline Score';
    actionDescription = 'Add a practice test or load sample tests to calibrate your study plan and target gap.';
    actionBadge = 'Step 1';
    actionBadgeColor = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    ctaText = 'Add First Test';
    ctaTarget = 'history';
  } else if (scoreGap === 0 && currentScore > 0) {
    actionTitle = 'Target Achieved — Exam Endurance';
    actionDescription = `You have surpassed your target score of ${targetScore}! Schedule a full-length timed simulation to lock in test-day pacing.`;
    actionBadge = 'Goal Reached';
    actionBadgeColor = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    ctaText = 'View Schedule';
    ctaTarget = 'planner';
  } else if (hasEasyM2) {
    actionTitle = 'Module 1 Accuracy Priority';
    actionDescription = 'An easier Module 2 was routed on your latest test, capping section potential. Drill Module 1 foundations to unlock the high-scoring second stage.';
    actionBadge = 'Pacing Priority';
    actionBadgeColor = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    ctaText = 'Review History';
    ctaTarget = 'history';
  } else if (recentMistakesCount > 0) {
    actionTitle = `Triage ${recentMistakesCount} Logged Errors`;
    actionDescription = `You have ${recentMistakesCount} flagged error${recentMistakesCount > 1 ? 's' : ''} in your latest test notebook. Categorize these into conceptual vs. time pressure mistakes.`;
    actionBadge = 'Error Log';
    actionBadgeColor = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    ctaText = 'Triage Errors';
    ctaTarget = 'history';
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#1a2942] to-slate-900 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-card">
      <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-4 flex-col sm:flex-row">
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5 sm:mt-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-indigo-300">
                Next Best Action
              </span>
              <span className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${actionBadgeColor}`}>
                {actionBadge}
              </span>
              {scoreGap > 0 && (
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-400">
                  • {scoreGap} pts to {targetScore}
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-base font-black text-white">{actionTitle}</h3>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 sm:mt-1 max-w-2xl leading-relaxed">
              {actionDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onNavigateTab(ctaTarget)}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black text-slate-900 bg-white hover:bg-slate-100 rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
