import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Calendar, BookOpen } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { SATTest } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';

function TestRow({
  test,
  onDelete,
  isBest,
}: {
  test: SATTest;
  onDelete: (id: string) => void;
  isBest: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDomains = Object.values(test.domains || {}).some(d => d?.score != null || d?.pct != null);
  const dateStr = test.date
    ? new Date(test.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date';

  return (
    <>
      <div
        className={`grid items-center gap-3 px-4 py-3 border-b border-[#f0f2f5] last:border-b-0 text-sm ${
          isBest ? 'bg-[#f6fff9]' : 'hover:bg-[#fafbfc]'
        } transition-colors`}
        style={{ gridTemplateColumns: '1.7fr 0.6fr 0.6fr 0.6fr auto auto' }}
      >
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#182235] truncate">{test.name || 'Practice Test'}</span>
            {isBest && (
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                BEST
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#6f7b90]">
            <Calendar className="w-3 h-3" />
            {dateStr}
            {test.source && <> · {test.source}</>}
          </div>
        </div>
        <div className="font-extrabold text-[#182235] text-sm">{test.total}</div>
        <div className="text-[#405978] font-semibold">{test.rw}</div>
        <div className="text-[#405978] font-semibold">{test.math}</div>

        <button
          onClick={() => setExpanded(e => !e)}
          disabled={!hasDomains && !test.notes}
          className="text-[#6f7b90] hover:text-[#2c4160] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={hasDomains ? 'View domain details' : 'No domain data'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            if (window.confirm('Delete this test? This cannot be undone.')) {
              onDelete(test.id);
            }
          }}
          className="text-[#6f7b90] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
          title="Delete test"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (hasDomains || test.notes) && (
        <div className="bg-[#fafbfc] border-b border-[#f0f2f5] px-4 py-3">
          {test.notes && (
            <div className="mb-3 flex items-start gap-2 text-xs text-[#405978]">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#6f7b90]" />
              <span className="italic">{test.notes}</span>
            </div>
          )}
          {hasDomains && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DOMAIN_META.map(d => {
                const v = test.domains?.[d.id];
                if (!v || (v.score == null && v.pct == null)) return null;
                return (
                  <div key={d.id} className="bg-white border border-[#e5e9f0] rounded-lg p-2">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] truncate">{d.name}</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {v.score != null && <span className="text-base font-black text-[#182235]">{v.score}</span>}
                      {v.pct != null && <span className="text-xs text-[#6f7b90]">{v.pct}%</span>}
                    </div>
                    {v.correct != null && v.total != null && (
                      <div className="text-[10px] text-[#6f7b90] mt-0.5">{v.correct}/{v.total} correct</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export const TestHistory: React.FC = () => {
  const { orderedTests, deleteTest, personalBest } = useSAT();
  const rows = [...orderedTests].reverse().slice(0, 10);

  return (
    <section className="bg-white border border-[#e5e9f0] rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-[#f0f2f5] flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#182235]">Recent Tests</h2>
          <p className="text-xs text-[#6f7b90] mt-0.5">Your saved score history.</p>
        </div>
        <span className="text-xs font-bold text-[#6f7b90] bg-[#eef2f7] px-2 py-1 rounded-lg">
          {orderedTests.length} test{orderedTests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-sm text-[#6f7b90]">
          No tests saved yet.
        </div>
      ) : (
        <>
          {/* Header */}
          <div
            className="grid px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] border-b border-[#f0f2f5]"
            style={{ gridTemplateColumns: '1.7fr 0.6fr 0.6fr 0.6fr auto auto' }}
          >
            <span>Test</span>
            <span>Total</span>
            <span>R&W</span>
            <span>Math</span>
            <span />
            <span />
          </div>

          {rows.map(test => (
            <TestRow
              key={test.id}
              test={test}
              onDelete={deleteTest}
              isBest={test.total === personalBest}
            />
          ))}

          {orderedTests.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-[#6f7b90]">
              Showing 10 most recent. Export to see all {orderedTests.length}.
            </div>
          )}
        </>
      )}
    </section>
  );
};
