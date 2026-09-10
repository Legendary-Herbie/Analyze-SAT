import React from 'react';
import { AlertTriangle, Star, Zap, BarChart2, Target } from 'lucide-react';
import { useSAT } from '../context/SATContext';

function InsightCard({
  icon: Icon,
  iconBg,
  label,
  value,
  detail
}: {
  icon: React.ElementType;
  iconBg: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="p-4 border-b border-[#f0f2f5] last:border-b-0">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] mb-0.5">{label}</div>
          <div className="text-base font-extrabold text-[#182235] leading-snug">{value}</div>
          <div className="text-xs text-[#6f7b90] leading-relaxed mt-1">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function SectionInsights({
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
    <div>
      <div className="px-4 py-2 bg-[#f6f8fb] border-b border-[#f0f2f5]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#405978]">
          {sectionLabel}
        </span>
      </div>

      {strongest && (
        <InsightCard
          icon={Star}
          iconBg="bg-emerald-50 text-emerald-600"
          label="Strongest"
          value={strongest.domain.name}
          detail={`Score ${strongest.latestScore}${strongest.averageScore ? ` · avg ${strongest.averageScore}` : ''}${strongest.latestPct != null ? ` · ${strongest.latestPct}% accuracy` : ''}.`}
        />
      )}

      {weakest && !sameItem && (
        <InsightCard
          icon={AlertTriangle}
          iconBg="bg-red-50 text-red-500"
          label="Priority Area"
          value={weakest.domain.name}
          detail={`Score ${weakest.latestScore}${weakest.latestPct != null ? ` · ${weakest.latestPct}% accuracy` : ''}. Focus here for the biggest gain.`}
        />
      )}
    </div>
  );
}

function ProgressToGoal({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const needed = Math.max(0, target - current);
  const reached = current >= target;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90]">Progress to Goal</div>
        <div className={`text-xs font-bold ${reached ? 'text-emerald-600' : 'text-[#2c4160]'}`}>
          {current} / {target}
        </div>
      </div>
      <div className="w-full h-2.5 bg-[#eef1f5] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${reached ? 'bg-emerald-500' : 'bg-[#2c4160]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-[#6f7b90] mt-1.5">
        {reached
          ? '🎉 Goal reached! Consider raising it.'
          : `${needed} more points needed (${pct}% there)`}
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
    <aside className="flex flex-col gap-5">
      <section className="bg-white border border-[#e5e9f0] rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-[#f0f2f5]">
          <h2 className="text-base font-extrabold text-[#182235]">Performance Insights</h2>
          <p className="text-xs text-[#6f7b90] mt-0.5">Automatically generated from your data.</p>
        </div>

        {!hasInsights ? (
          <div className="p-5 text-sm text-[#6f7b90] text-center">
            Add at least one test to see insights.
          </div>
        ) : (
          <>
            {latestTest && targetScore && (
              <>
                <ProgressToGoal current={latestTest.total} target={targetScore} />
                <div className="border-t border-[#f0f2f5]" />
              </>
            )}

            {hasSectionData ? (
              <>
                <SectionInsights sectionLabel="Reading & Writing" sectionKey="rw" />
                <SectionInsights sectionLabel="Math" sectionKey="math" />
              </>
            ) : latestTest ? (
              <InsightCard
                icon={BarChart2}
                iconBg="bg-[#eef2f7] text-[#405978]"
                label="Domain Data"
                value="Not entered"
                detail="Add domain details when logging tests to unlock strength & weakness analysis."
              />
            ) : null}

            {mostImproved && (mostImproved.delta ?? 0) > 0 && (
              <>
                <div className="border-t border-[#f0f2f5]" />
                <InsightCard
                  icon={Zap}
                  iconBg="bg-amber-50 text-amber-600"
                  label="Largest Recent Gain"
                  value={mostImproved.domain.name}
                  detail={`+${mostImproved.delta} points from previous recorded domain score.`}
                />
              </>
            )}

            {superscore && (
              <>
                <div className="border-t border-[#f0f2f5]" />
                <InsightCard
                  icon={Target}
                  iconBg="bg-blue-50 text-blue-600"
                  label="Superscore"
                  value={`${superscore.total}`}
                  detail={`Best R&W ${superscore.rw} + Best Math ${superscore.math} across all tests.`}
                />
              </>
            )}

            {averageScore && (
                value="Not entered"
                detail="Add domain details when logging tests to unlock full strength & weakness analysis."
              />
            )}
          </>
        )}
      </section>
    </aside>
  );
};
