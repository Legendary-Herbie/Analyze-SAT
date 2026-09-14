import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  History,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { DomainTrend } from '../types/sat';

type FilterType = 'all' | 'rw' | 'math';

const ASSESSMENT_CONFIG = {
  'Major strength': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  'Strong': {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  'Developing': {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  'Priority area': {
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  'No score': {
    bg: 'bg-gray-50 dark:bg-slate-800',
    text: 'text-gray-500 dark:text-slate-400',
    border: 'border-gray-200 dark:border-slate-700',
    dot: 'bg-gray-400',
  },
};

const DOMAIN_STRATEGIES: Record<string, string> = {
  algebra: 'Master linear systems and equations. Desmos tip: type equations directly to identify exact intersection points in seconds.',
  advanced: 'Focus on quadratics, polynomials, and vertex form. Desmos tip: graph functions to verify real roots and extrema immediately.',
  problem: 'Watch out for percentage change vs. percentage points, unit conversions, and two-way conditional probability tables.',
  geometry: 'Memorize the circle standard equation (x-h)² + (y-k)² = r², 30-60-90 / 45-45-90 right triangles, and SOH-CAH-TOA.',
  info: 'Anchor directly to text lines for textual evidence. For infographic data, double-check axis labels before picking an answer.',
  craft: 'Words in context: replace the blank with your own synonym before looking at options. Eliminate choices with extreme tones.',
  expression: 'Rhetorical synthesis: read only the question prompt to identify the specific goal, then select the single bullet fulfilling it.',
  english: 'Isolate subjects and verbs by ignoring non-essential prepositional phrases. Check for semicolon and comma splice rules.',
};

function SegmentBar({ score, isDoubleSize }: { score: number | null; isDoubleSize?: boolean }) {
  const filled = score == null ? 0 : Math.max(0, Math.min(7, Math.round(((score - 200) / 600) * 7)));
  return (
    <div>
      <div className={`flex gap-1 sm:gap-1.5 ${isDoubleSize ? 'mt-2.5 sm:mt-4' : 'mt-2 sm:mt-3'}`}>
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`${isDoubleSize ? 'h-2.5 sm:h-3.5 rounded' : 'h-2 sm:h-2.5 rounded-sm'} flex-1 transition-all ${
              i < filled
                ? 'bg-[#2c4160] dark:bg-indigo-500 shadow-xs'
                : 'bg-[#eef1f5] dark:bg-slate-800'
            }`}
          />
        ))}
      </div>
      <div className={`flex justify-between ${isDoubleSize ? 'mt-1 text-[10px] sm:text-xs font-bold' : 'mt-0.5 text-[9px] sm:text-[10px]'} text-[#6f7b90] dark:text-slate-400`}>
        <span>200</span>
        {isDoubleSize && <span>400</span>}
        {isDoubleSize && <span>600</span>}
        <span>800</span>
      </div>
    </div>
  );
}

function DomainCard({
  trend,
  isDoubleSize,
  onScheduleDrill,
}: {
  trend: DomainTrend;
  isDoubleSize: boolean;
  onScheduleDrill?: (domainId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { domain, latestScore, latestPct, averageScore, delta, assessment, scoresHistory } = trend;
  const config = ASSESSMENT_CONFIG[assessment];

  const hasDomainData = latestScore != null || latestPct != null;
  if (!hasDomainData) return null;

  // Double size card layout
  if (isDoubleSize) {
    const tip = DOMAIN_STRATEGIES[domain.id];
    return (
      <div className="border border-[#e5e9f0] dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 hover:border-[#b6c4d4] dark:hover:border-slate-700 transition-all bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-3.5 sm:space-y-4">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2.5 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-sm sm:text-lg font-black text-[#182235] dark:text-white leading-tight">
                  {domain.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}
                >
                  <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${config.dot}`} />
                  {assessment}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#405978] dark:text-indigo-400 mt-0.5 sm:mt-1">
                {domain.section === 'rw' ? 'Reading & Writing Section' : 'Math Section'}
              </div>
              {domain.description && (
                <p className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 mt-1 sm:mt-2 leading-relaxed hidden sm:block">
                  {domain.description}
                </p>
              )}
            </div>

            <div className="text-right shrink-0 bg-[#f8fafc] dark:bg-slate-800/80 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-[#e5e9f0] dark:border-slate-700">
              <div className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#182235] dark:text-white">
                {latestPct != null ? `${latestPct}%` : '—'}
              </div>
              {latestScore != null && (
                <div className="text-[10px] sm:text-xs font-extrabold text-[#6f7b90] dark:text-slate-300 mt-0.5">
                  {latestScore}/800
                </div>
              )}
            </div>
          </div>

          {/* Segment Bar */}
          {latestScore != null && <SegmentBar score={latestScore} isDoubleSize={true} />}

          {/* 3-Column Metrics Row */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mt-2.5 sm:mt-4">
            <div className="bg-[#f8fafc] dark:bg-slate-800/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#eef2f7] dark:border-slate-800">
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                Average
              </div>
              <div className="text-sm sm:text-base font-black text-[#182235] dark:text-slate-100 mt-0.5">
                {averageScore != null ? averageScore : '—'}
              </div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-slate-800/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#eef2f7] dark:border-slate-800">
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                Momentum
              </div>
              <div className="text-sm sm:text-base font-black mt-0.5 flex items-center gap-0.5 sm:gap-1">
                {delta !== null ? (
                  <span
                    className={`flex items-center gap-0.5 ${
                      delta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : delta < 0
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-[#6f7b90] dark:text-slate-400'
                    }`}
                  >
                    {delta > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : delta < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <Minus className="w-3.5 h-3.5" />
                    )}
                    {delta > 0 ? '+' : ''}
                    {delta}
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-[#6f7b90] dark:text-slate-400">First test</span>
                )}
              </div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-slate-800/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-[#eef2f7] dark:border-slate-800">
              <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                Tests
              </div>
              <div className="text-sm sm:text-base font-black text-[#182235] dark:text-slate-100 mt-0.5">
                {scoresHistory.length}
              </div>
            </div>
          </div>
        </div>

        {/* History and Tip Section */}
        <div className="space-y-2.5 sm:space-y-3 pt-2 border-t border-[#f0f2f5] dark:border-slate-800">
          {scoresHistory.length > 1 && (
            <div>
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#6f7b90] dark:text-slate-400 mb-1.5 sm:mb-2">
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#405978] dark:text-indigo-400" />
                  Progression Across Tests
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#405978] dark:text-indigo-400 font-semibold">
                  Latest: {latestScore}
                </span>
              </div>
              <div className="flex items-end gap-1.5 sm:gap-2.5 bg-[#f8fafc] dark:bg-slate-800/40 p-2 sm:p-3 rounded-xl border border-[#eef2f7] dark:border-slate-800/80">
                {scoresHistory.map((s, i) => {
                  const barH = Math.max(6, ((s - 200) / 600) * 44);
                  const isLast = i === scoresHistory.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#182235] dark:text-slate-300">{s}</span>
                      <div className="w-full h-11 sm:h-14 flex items-end justify-center">
                        <div
                          className={`w-full max-w-[28px] rounded-t-md transition-all ${
                            isLast
                              ? 'bg-[#2c4160] dark:bg-indigo-500 shadow-sm'
                              : 'bg-[#b6c4d4] dark:bg-slate-700'
                          }`}
                          style={{ height: barH }}
                        />
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-semibold text-[#6f7b90] dark:text-slate-400">T{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tip && (
            <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200">
              <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-extrabold text-amber-950 dark:text-amber-300">dSAT Strategy: </strong>
                {tip}
              </div>
            </div>
          )}

          {/* Action Row: Schedule drill directly */}
          {onScheduleDrill && (
            <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#f0f2f5] dark:border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-[#6f7b90] dark:text-slate-400">
                Status: <strong className="text-[#182235] dark:text-slate-200">{assessment}</strong>
              </span>
              <button
                type="button"
                onClick={() => onScheduleDrill(domain.id)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-extrabold text-[#2c4160] dark:text-indigo-300 bg-[#f0f4f9] dark:bg-slate-800 hover:bg-[#e2eaf4] dark:hover:bg-slate-700 rounded-lg sm:rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Schedule Drill</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact 1x card layout (when 'All' is selected)
  return (
    <div className="border border-[#e5e9f0] dark:border-slate-800 rounded-xl p-3 sm:p-4 hover:border-[#c8d0db] dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-[#182235] dark:text-slate-100">{domain.name}</span>
            <span
              className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {assessment}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#6f7b90] dark:text-slate-400 mt-0.5">
            {domain.section === 'rw' ? 'Reading & Writing' : 'Math'}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl sm:text-2xl font-black text-[#182235] dark:text-white">
            {latestPct != null ? `${latestPct}%` : '—'}
          </div>
          {latestScore != null && (
            <div className="text-[10px] sm:text-[11px] text-[#6f7b90] dark:text-slate-400 font-semibold">
              Score: {latestScore}
            </div>
          )}
        </div>
      </div>

      {latestScore != null && <SegmentBar score={latestScore} isDoubleSize={false} />}

      <div className="flex items-center justify-between mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 flex-wrap gap-1.5">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {averageScore != null && (
            <span>
              Avg: <strong className="text-[#182235] dark:text-slate-200">{averageScore}</strong>
            </span>
          )}
          {delta !== null && (
            <span
              className={`flex items-center gap-0.5 font-bold ${
                delta > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : delta < 0
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-[#6f7b90] dark:text-slate-400'
              }`}
            >
              {delta > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : delta < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
          {scoresHistory.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#405978] dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
            >
              History <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {onScheduleDrill && (
          <button
            type="button"
            onClick={() => onScheduleDrill(domain.id)}
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[#2c4160] dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 bg-[#f0f4f9] dark:bg-slate-800 hover:bg-[#e2eaf4] dark:hover:bg-slate-700/80 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg transition-colors cursor-pointer"
            title={`Schedule a practice drill for ${domain.name}`}
          >
            <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Drill</span>
          </button>
        )}
      </div>

      {expanded && scoresHistory.length > 1 && (
        <div className="mt-2.5 pt-2.5 border-t border-[#f0f2f5] dark:border-slate-800">
          <div className="text-[9px] sm:text-[10px] text-[#6f7b90] dark:text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            Score History
          </div>
          <div className="flex items-end gap-1.5">
            {scoresHistory.map((s, i) => {
              const barH = Math.max(4, ((s - 200) / 600) * 40);
              const isLast = i === scoresHistory.length - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] sm:text-[9px] text-[#6f7b90] dark:text-slate-400">{s}</span>
                  <div
                    className={`w-4 sm:w-5 rounded-t-sm ${
                      isLast ? 'bg-[#2c4160] dark:bg-indigo-500' : 'bg-[#b6c4d4] dark:bg-slate-700'
                    }`}
                    style={{ height: barH }}
                  />
                  <span className="text-[7px] sm:text-[8px] text-[#6f7b90] dark:text-slate-400">T{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const DomainAnalysis: React.FC<{
  onScheduleDrill?: (domainId: string) => void;
  onOpenAddModal?: () => void;
}> = ({ onScheduleDrill, onOpenAddModal }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [manualDoubleSize, setManualDoubleSize] = useState<boolean | null>(null);
  const [isGridCollapsed, setIsGridCollapsed] = useState(false);
  const { domainTrends, latestTest, resetToSample } = useSAT();

  const filtered = domainTrends.filter(dt => {
    if (filter !== 'all' && dt.domain.section !== filter) return false;
    return dt.latestScore != null || dt.latestPct != null;
  });

  const hasAny = filtered.length > 0;

  // Identify top high-leverage domains (priority or developing)
  const priorityDomains = [...domainTrends]
    .filter(d => d.latestScore != null)
    .sort((a, b) => (a.latestScore ?? 800) - (b.latestScore ?? 800))
    .slice(0, 2);

  // Identify top strength
  const topStrength = [...domainTrends]
    .filter(d => d.latestScore != null)
    .sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0))[0];

  // When a section tab ('rw' or 'math') is selected, the card size is twice the size (double size).
  // Users can also toggle manual double size if desired.
  const isDoubleSize = manualDoubleSize !== null ? manualDoubleSize : filter !== 'all';

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    // Reset manual override so selecting a tab automatically triggers double size for sections
    setManualDoubleSize(null);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-card transition-all space-y-3.5 sm:space-y-5">
      {/* High-Leverage Scannable Summary Banner */}
      {hasAny && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e5e9f0] dark:border-slate-700/70">
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Highest-Leverage Target Areas
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-1">
              {priorityDomains.map(pd => (
                <div
                  key={pd.domain.id}
                  className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-[#182235] dark:text-white block truncate">
                      {pd.domain.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#6f7b90] dark:text-slate-400">
                      Score: {pd.latestScore} · {pd.assessment}
                    </span>
                  </div>
                  {onScheduleDrill && (
                    <button
                      type="button"
                      onClick={() => onScheduleDrill(pd.domain.id)}
                      className="text-[10px] font-extrabold text-[#2c4160] dark:text-indigo-400 hover:text-indigo-600 bg-[#f0f4f9] dark:bg-slate-700 px-2 py-0.5 sm:py-1 rounded-md transition-colors shrink-0 ml-2"
                    >
                      Drill
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between p-2.5 sm:p-3 rounded-lg bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Top Domain Asset
            </div>
            <div>
              <div className="text-xs font-black text-[#182235] dark:text-white truncate">
                {topStrength ? topStrength.domain.name : 'All domains consistent'}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {topStrength ? `${topStrength.latestScore} (${topStrength.assessment})` : 'Solid performance'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-extrabold text-[#182235] dark:text-slate-100">Domain Analysis</h2>
            {isDoubleSize && (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3 h-3" />
                2x Detailed View
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            {filter === 'all'
              ? 'Showing all 8 College Board dSAT domains across Reading & Writing and Math.'
              : filter === 'rw'
              ? 'Showing 4 Reading & Writing domains in expanded 2x double-size card view.'
              : 'Showing 4 Math domains in expanded 2x double-size card view.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          {/* Filter Tabs */}
          <div className="flex gap-1 p-0.5 sm:p-1 bg-[#f6f8fb] dark:bg-slate-800/70 border border-[#e5e9f0] dark:border-slate-700 rounded-lg sm:rounded-xl">
            {(['all', 'rw', 'math'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`text-[11px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                    : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235] dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'All (8)' : f === 'rw' ? 'R&W (4)' : 'Math (4)'}
              </button>
            ))}
          </div>

          {/* Quick Size Toggle button */}
          <button
            onClick={() => setManualDoubleSize(!isDoubleSize)}
            className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer ${
              isDoubleSize
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-[#6f7b90] dark:text-slate-300 border-[#e5e9f0] dark:border-slate-700 hover:border-[#c8d0db]'
            }`}
            title={isDoubleSize ? 'Switch to compact cards' : 'Switch to 2x double-size cards'}
          >
            {isDoubleSize ? '2x' : '1x'}
          </button>

          {/* Collapse/Expand full grid toggle */}
          <button
            onClick={() => setIsGridCollapsed(!isGridCollapsed)}
            className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#e5e9f0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#405978] dark:text-slate-300 hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-all inline-flex items-center gap-1 cursor-pointer"
            title={isGridCollapsed ? 'Expand all 8 domain cards' : 'Collapse grid to save vertical space'}
          >
            {isGridCollapsed ? (
              <>
                <span>Expand</span>
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Collapse</span>
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {!latestTest ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#eef2f7] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#2c4160] dark:text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#182235] dark:text-slate-100">
            Domain Mastery Awaiting Test Data
          </h3>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1 max-w-sm">
            Add a practice test with section breakdowns or load our 4 sample tests to view mastery levels across all 8 Digital SAT domains.
          </p>
          <div className="flex items-center gap-2.5 mt-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={resetToSample}
              className="px-4 py-2 text-xs font-extrabold text-[#182235] bg-amber-300 hover:bg-amber-200 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Load 4 Sample Tests</span>
            </button>
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-4 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:bg-[#f6f8fb] dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                + Add Practice Test
              </button>
            )}
          </div>
        </div>
      ) : !hasAny ? (
        <div className="flex flex-col items-center justify-center h-28 gap-2 text-center">
          <p className="text-sm text-[#6f7b90] dark:text-slate-400">No domain details entered for this test.</p>
          <p className="text-xs text-[#b0bac8] dark:text-slate-500">Use "Domain Details" when adding a test to see this analysis.</p>
        </div>
      ) : isGridCollapsed ? (
        <div className="p-4 rounded-xl border border-dashed border-[#e5e9f0] dark:border-slate-800 text-center">
          <p className="text-xs text-[#6f7b90] dark:text-slate-400">
            Domain cards are collapsed. Click <button onClick={() => setIsGridCollapsed(false)} className="text-indigo-600 dark:text-indigo-400 font-extrabold underline">Expand All</button> above to inspect individual domain mastery cards.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-2.5 sm:gap-4 transition-all duration-300 ${
            isDoubleSize
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {filtered.map(trend => (
            <DomainCard
              key={trend.domain.id}
              trend={trend}
              isDoubleSize={isDoubleSize}
              onScheduleDrill={onScheduleDrill}
            />
          ))}
        </div>
      )}
    </section>
  );
};

