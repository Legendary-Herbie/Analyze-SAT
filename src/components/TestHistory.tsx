import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Calendar, BookOpen, Edit2, Compass } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { SATTest } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';
import { ConfirmDialog } from './ConfirmDialog';

function TestRow({
  test,
  onRequestDelete,
  onEdit,
  isBest,
}: {
  test: SATTest;
  onRequestDelete: (test: SATTest) => void;
  onEdit?: (test: SATTest) => void;
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
        className={`grid items-center gap-3 px-4 py-3 border-b border-[#f0f2f5] dark:border-slate-800 last:border-b-0 text-sm ${
          isBest ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'hover:bg-[#fafbfc] dark:hover:bg-slate-800/50'
        } transition-colors`}
        style={{ gridTemplateColumns: '1.7fr 0.6fr 0.6fr 0.6fr auto auto auto' }}
      >
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#182235] dark:text-slate-100 truncate">{test.name || 'Practice Test'}</span>
            {isBest && (
              <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-full shrink-0">
                BEST
              </span>
            )}
            {test.moduleRouting?.rwModule2Difficulty === 'hard' && test.moduleRouting?.mathModule2Difficulty === 'hard' && (
              <span className="text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded-full shrink-0 border border-indigo-200 dark:border-indigo-800">
                Hard M2 Unlocked
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#6f7b90] dark:text-slate-400">
            <Calendar className="w-3 h-3" />
            {dateStr}
            {test.source && <> · {test.source}</>}
          </div>
        </div>
        <div className="font-extrabold text-[#182235] dark:text-white text-sm">{test.total}</div>
        <div className="text-[#405978] dark:text-slate-300 font-semibold">{test.rw}</div>
        <div className="text-[#405978] dark:text-slate-300 font-semibold">{test.math}</div>

        <button
          onClick={() => setExpanded(e => !e)}
          disabled={!hasDomains && !test.notes && !test.moduleRouting}
          className="text-[#6f7b90] dark:text-slate-400 hover:text-[#2c4160] dark:hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={hasDomains ? 'View domain details' : 'No domain data'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {onEdit && (
          <button
            onClick={() => onEdit(test)}
            className="text-[#6f7b90] dark:text-slate-400 hover:text-[#2c4160] dark:hover:text-indigo-400 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit test"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onRequestDelete(test)}
          className="text-[#6f7b90] dark:text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
          title="Delete test"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (hasDomains || test.notes || test.moduleRouting) && (
        <div className="bg-[#fafbfc] dark:bg-slate-800/60 border-b border-[#f0f2f5] dark:border-slate-800 px-4 py-3">
          {test.moduleRouting && (
            <div className="flex items-center gap-2 mb-2 text-xs text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-[#e5e9f0] dark:border-slate-700">
              <Compass className="w-3.5 h-3.5" />
              <span>
                Adaptive Routing: R&W Module 2 (<strong>{test.moduleRouting.rwModule2Difficulty || 'Not set'}</strong>) · Math Module 2 (<strong>{test.moduleRouting.mathModule2Difficulty || 'Not set'}</strong>)
              </span>
            </div>
          )}

          {test.notes && (
            <div className="mb-3 flex items-start gap-2 text-xs text-[#405978] dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#6f7b90] dark:text-slate-400" />
              <span className="italic">{test.notes}</span>
            </div>
          )}

          {hasDomains && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DOMAIN_META.map(d => {
                const v = test.domains?.[d.id];
                if (!v || (v.score == null && v.pct == null)) return null;
                return (
                  <div key={d.id} className="bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-lg p-2">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 truncate">
                      {d.name}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {v.score != null && (
                        <span className="text-base font-black text-[#182235] dark:text-white">{v.score}</span>
                      )}
                      {v.pct != null && (
                        <span className="text-xs text-[#6f7b90] dark:text-slate-400">{v.pct}%</span>
                      )}
                    </div>
                    {v.correct != null && v.total != null && (
                      <div className="text-[10px] text-[#6f7b90] dark:text-slate-400 mt-0.5">
                        {v.correct}/{v.total} correct
                      </div>
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

export const TestHistory: React.FC<{ onEditTest?: (test: SATTest) => void }> = ({ onEditTest }) => {
  const { orderedTests, deleteTest, personalBest } = useSAT();
  const [testToDelete, setTestToDelete] = useState<SATTest | null>(null);
  const rows = [...orderedTests].reverse().slice(0, 10);

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-[#f0f2f5] dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100">Recent Tests</h2>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">Your saved score history.</p>
        </div>
        <span className="text-xs font-bold text-[#6f7b90] dark:text-slate-300 bg-[#eef2f7] dark:bg-slate-800 px-2 py-1 rounded-lg">
          {orderedTests.length} test{orderedTests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-24 text-sm text-[#6f7b90] dark:text-slate-400">
          No tests saved yet.
        </div>
      ) : (
        <>
          {/* Header */}
          <div
            className="grid px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 border-b border-[#f0f2f5] dark:border-slate-800"
            style={{ gridTemplateColumns: '1.7fr 0.6fr 0.6fr 0.6fr auto auto auto' }}
          >
            <span>Test</span>
            <span>Total</span>
            <span>R&W</span>
            <span>Math</span>
            <span />
            <span />
            <span />
          </div>

          {rows.map(test => (
            <TestRow
              key={test.id}
              test={test}
              onRequestDelete={setTestToDelete}
              onEdit={onEditTest}
              isBest={test.total === personalBest}
            />
          ))}

          {orderedTests.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-[#6f7b90] dark:text-slate-400">
              Showing 10 most recent. Export to see all {orderedTests.length}.
            </div>
          )}
        </>
      )}

      {/* In-app reliable confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(testToDelete)}
        title="Delete Practice Test?"
        message={`Are you sure you want to delete "${testToDelete?.name || 'this test'}" (${testToDelete?.total} total score)? This will update all superscore and trend averages.`}
        confirmLabel="Delete Test"
        variant="danger"
        onConfirm={() => {
          if (testToDelete) {
            deleteTest(testToDelete.id);
            setTestToDelete(null);
          }
        }}
        onCancel={() => setTestToDelete(null)}
      />
    </section>
  );
};
