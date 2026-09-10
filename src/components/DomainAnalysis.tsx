import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { DomainTrend } from '../types/sat';

type FilterType = 'all' | 'rw' | 'math';

const ASSESSMENT_CONFIG = {
  'Major strength': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Strong': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Developing': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Priority area': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  'No score': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' },
};

function SegmentBar({ score }: { score: number | null }) {
  const filled = score == null ? 0 : Math.max(0, Math.min(7, Math.round((score - 200) / 600 * 7)));
  return (
    <div>
      <div className="flex gap-1 mt-3">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 flex-1 rounded-sm transition-colors ${i < filled ? 'bg-[#405978]' : 'bg-[#eef1f5]'}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-[#6f7b90]">
        <span>200</span><span>800</span>
      </div>
    </div>
  );
}

function DomainCard({ trend }: { trend: DomainTrend }) {
  const [expanded, setExpanded] = useState(false);
  const { domain, latestScore, latestPct, averageScore, delta, assessment, scoresHistory } = trend;
  const config = ASSESSMENT_CONFIG[assessment];

  const hasDomainData = latestScore != null || latestPct != null;
  if (!hasDomainData) return null;

  return (
    <div className="border border-[#e5e9f0] rounded-xl p-4 hover:border-[#c8d0db] transition-colors bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-extrabold text-[#182235]">{domain.name}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {assessment}
            </span>
          </div>
          <div className="text-[11px] text-[#6f7b90] mt-1">
            {domain.section === 'rw' ? 'Reading & Writing' : 'Math'}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-[#182235]">
            {latestPct != null ? `${latestPct}%` : '—'}
          </div>
          {latestScore != null && (
            <div className="text-[11px] text-[#6f7b90] font-semibold mt-0.5">Score: {latestScore}</div>
          )}
        </div>
      </div>

      {latestScore != null && <SegmentBar score={latestScore} />}

      <div className="flex items-center justify-between mt-3 text-xs text-[#6f7b90] flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {averageScore != null && (
            <span>Avg: <strong className="text-[#182235]">{averageScore}</strong></span>
          )}
          {delta !== null && (
            <span className={`flex items-center gap-1 font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-500' : 'text-[#6f7b90]'}`}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {delta > 0 ? '+' : ''}{delta} pts
            </span>
          )}
          {scoresHistory.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#405978] hover:text-[#2c4160] flex items-center gap-0.5 font-semibold"
            >
              History <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {expanded && scoresHistory.length > 1 && (
        <div className="mt-3 pt-3 border-t border-[#f0f2f5]">
          <div className="text-[10px] text-[#6f7b90] font-bold uppercase tracking-wider mb-2">Score History</div>
          <div className="flex items-end gap-1.5">
            {scoresHistory.map((s, i) => {
              const barH = Math.max(4, ((s - 200) / 600) * 48);
              const isLast = i === scoresHistory.length - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-[#6f7b90]">{s}</span>
                  <div
                    className={`w-5 rounded-t-sm ${isLast ? 'bg-[#2c4160]' : 'bg-[#b6c4d4]'}`}
                    style={{ height: barH }}
                  />
                  <span className="text-[8px] text-[#6f7b90]">T{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const DomainAnalysis: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const { domainTrends, latestTest } = useSAT();

  const filtered = domainTrends.filter(dt => {
    if (filter !== 'all' && dt.domain.section !== filter) return false;
    return dt.latestScore != null || dt.latestPct != null;
  });

  const hasAny = filtered.length > 0;

  return (
    <section className="bg-white border border-[#e5e9f0] rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#182235]">Domain Analysis</h2>
          <p className="text-xs text-[#6f7b90] mt-0.5">Showing data from your most recent test.</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {(['all', 'rw', 'math'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full border transition-all ${
                filter === f
                  ? 'bg-[#2c4160] text-white border-[#2c4160]'
                  : 'bg-white text-[#6f7b90] border-[#e5e9f0] hover:border-[#c8d0db]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'rw' ? 'R&W' : 'Math'}
            </button>
          ))}
        </div>
      </div>

      {!latestTest ? (
        <div className="flex items-center justify-center h-24 text-sm text-[#6f7b90]">
          Add a test to see domain analysis
        </div>
      ) : !hasAny ? (
        <div className="flex flex-col items-center justify-center h-24 gap-2 text-center">
          <p className="text-sm text-[#6f7b90]">No domain details entered for this test.</p>
          <p className="text-xs text-[#b0bac8]">Use "Domain Details" when adding a test to see this analysis.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(trend => (
            <DomainCard key={trend.domain.id} trend={trend} />
          ))}
        </div>
      )}
    </section>
  );
};
