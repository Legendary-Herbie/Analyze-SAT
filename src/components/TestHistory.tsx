import React, { useState } from 'react';
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  BookOpen,
  Edit2,
  Compass,
  Check,
  X,
  SlidersHorizontal,
  Layers,
  AlertOctagon,
  ArrowLeftRight,
  Sparkles
} from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { SATTest } from '../types/sat';
import { DOMAIN_META, getEffectiveDomainScore, getEffectiveDomainPct } from '../constants/domains';
import { ConfirmDialog } from './ConfirmDialog';

function TestRow({
  test,
  onRequestDelete,
  onEdit,
  onOpenCompare,
  isBest,
  isCompact,
}: {
  test: SATTest;
  onRequestDelete: (test: SATTest) => void;
  onEdit?: (test: SATTest) => void;
  onOpenCompare?: (testId?: string) => void;
  isBest: boolean;
  isCompact?: boolean;
}) {
  const { updateTest } = useSAT();
  const [expanded, setExpanded] = useState(false);
  const [isQuickEditing, setIsQuickEditing] = useState(false);

  // Quick edit local states
  const [quickName, setQuickName] = useState(test.name);
  const [quickDate, setQuickDate] = useState(test.date);
  const [quickTotal, setQuickTotal] = useState(String(test.total));
  const [quickRw, setQuickRw] = useState(String(test.rw));
  const [quickMath, setQuickMath] = useState(String(test.math));

  const hasDomains = Object.values(test.domains || {}).some(
    d => getEffectiveDomainScore(d) != null || getEffectiveDomainPct(d) != null
  );
  const hasMistakes = Boolean(test.mistakes && test.mistakes.length > 0);

  const dateStr = test.date
    ? new Date(test.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date';

  const handleSaveQuickEdit = () => {
    const parsedRw = parseInt(quickRw, 10);
    const parsedMath = parseInt(quickMath, 10);
    const parsedTotal = parseInt(quickTotal, 10);

    if (isNaN(parsedRw) || isNaN(parsedMath) || isNaN(parsedTotal)) return;

    updateTest(test.id, {
      name: quickName.trim() || test.name,
      date: quickDate || test.date,
      total: parsedTotal,
      rw: parsedRw,
      math: parsedMath,
    });
    setIsQuickEditing(false);
  };

  const handleCancelQuickEdit = () => {
    setQuickName(test.name);
    setQuickDate(test.date);
    setQuickTotal(String(test.total));
    setQuickRw(String(test.rw));
    setQuickMath(String(test.math));
    setIsQuickEditing(false);
  };

  const handleRwChange = (val: string) => {
    setQuickRw(val);
    const rwNum = parseInt(val, 10);
    const mathNum = parseInt(quickMath, 10);
    if (!isNaN(rwNum) && !isNaN(mathNum)) {
      setQuickTotal(String(rwNum + mathNum));
    }
  };

  const handleMathChange = (val: string) => {
    setQuickMath(val);
    const mathNum = parseInt(val, 10);
    const rwNum = parseInt(quickRw, 10);
    if (!isNaN(rwNum) && !isNaN(mathNum)) {
      setQuickTotal(String(rwNum + mathNum));
    }
  };

  if (isQuickEditing) {
    return (
      <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center justify-between">
          <span>Quick Inline Edit</span>
          <span className="text-[9px] font-normal text-amber-700 dark:text-amber-400">Press checkmark to save</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
          <input
            type="text"
            value={quickName}
            onChange={e => setQuickName(e.target.value)}
            className="sm:col-span-2 form-input text-xs py-1 px-2"
            placeholder="Test Name"
          />
          <input
            type="date"
            value={quickDate}
            onChange={e => setQuickDate(e.target.value)}
            className="form-input text-xs py-1 px-2"
          />
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">RW:</span>
              <input
                type="number"
                value={quickRw}
                onChange={e => handleRwChange(e.target.value)}
                className="form-input text-xs py-1 px-1.5 w-16"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">M:</span>
              <input
                type="number"
                value={quickMath}
                onChange={e => handleMathChange(e.target.value)}
                className="form-input text-xs py-1 px-1.5 w-16"
              />
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={handleSaveQuickEdit}
                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                title="Save inline changes"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancelQuickEdit}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                title="Cancel inline edit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid items-center gap-2 sm:gap-3 px-3 sm:px-4 ${
          isCompact ? 'py-1.5 sm:py-2 text-xs' : 'py-2.5 sm:py-3 text-xs sm:text-sm'
        } border-b border-[#f0f2f5] dark:border-slate-800 last:border-b-0 ${
          isBest ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'hover:bg-[#fafbfc] dark:hover:bg-slate-800/50'
        } transition-colors`}
        style={{ gridTemplateColumns: '1.7fr 0.6fr 0.6fr 0.6fr auto auto auto' }}
      >
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="font-bold text-[#182235] dark:text-slate-100 truncate text-xs sm:text-sm">{test.name || 'Practice Test'}</span>
            {isBest && (
              <span className="text-[8px] sm:text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-1 sm:px-1.5 py-0.5 rounded-full shrink-0">
                BEST
              </span>
            )}
            {hasMistakes && (
              <span className="text-[8px] sm:text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1 sm:px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                {test.mistakes?.length} err
              </span>
            )}
            {!isCompact && test.moduleRouting?.rwModule2Difficulty === 'hard' && test.moduleRouting?.mathModule2Difficulty === 'hard' && (
              <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-1 sm:px-1.5 py-0.5 rounded-full shrink-0 border border-indigo-200 dark:border-indigo-800 hidden sm:inline">
                Hard M2
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-[#6f7b90] dark:text-slate-400">
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{dateStr}</span>
            {test.source && <span className="hidden sm:inline"> · {test.source}</span>}
          </div>
        </div>
        <div className="font-extrabold text-[#182235] dark:text-white text-xs sm:text-sm">{test.total}</div>
        <div className="text-[#405978] dark:text-slate-300 font-semibold text-xs sm:text-sm">{test.rw}</div>
        <div className="text-[#405978] dark:text-slate-300 font-semibold text-xs sm:text-sm">{test.math}</div>

        <button
          onClick={() => setExpanded(e => !e)}
          disabled={!hasDomains && !test.notes && !test.moduleRouting && !hasMistakes}
          className="text-[#6f7b90] dark:text-slate-400 hover:text-[#2c4160] dark:hover:text-indigo-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0.5"
          title={hasDomains || hasMistakes ? 'View details & mistakes' : 'No domain data'}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {onOpenCompare && (
            <button
              onClick={() => onOpenCompare(test.id)}
              className="text-[#6f7b90] dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1 rounded-md sm:rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Compare this test with another"
            >
              <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsQuickEditing(true)}
            className="text-[#6f7b90] dark:text-slate-400 hover:text-[#2c4160] dark:hover:text-indigo-400 transition-colors p-1 rounded-md sm:rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Inline quick-edit (name, date, scores)"
          >
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(test)}
              className="text-[#6f7b90] dark:text-slate-400 hover:text-[#2c4160] dark:hover:text-indigo-400 transition-colors p-1 rounded-md sm:rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Open full edit modal"
            >
              <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => onRequestDelete(test)}
          className="text-[#6f7b90] dark:text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md sm:rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          title="Delete test"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {expanded && (hasDomains || test.notes || test.moduleRouting || hasMistakes) && (
        <div className="bg-[#fafbfc] dark:bg-slate-800/60 border-b border-[#f0f2f5] dark:border-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3">
          {test.moduleRouting && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-[#e5e9f0] dark:border-slate-700">
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>
                Adaptive Routing: R&W M2 (<strong>{test.moduleRouting.rwModule2Difficulty || 'Not set'}</strong>) · Math M2 (<strong>{test.moduleRouting.mathModule2Difficulty || 'Not set'}</strong>)
              </span>
            </div>
          )}

          {test.notes && (
            <div className="flex items-start gap-2 text-xs text-[#405978] dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#6f7b90] dark:text-slate-400" />
              <span className="italic">{test.notes}</span>
            </div>
          )}

          {hasMistakes && (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-[#e5e9f0] dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#182235] dark:text-white mb-2">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                <span>Mistake Notebook ({test.mistakes?.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {test.mistakes?.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-2 rounded-lg bg-[#f8fafc] dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-[#182235] dark:text-white">
                        {m.section === 'rw' ? 'R&W' : 'Math'} {m.questionNumber ? `Q${m.questionNumber}` : ''}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {m.reason}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6f7b90] dark:text-slate-400">{m.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasDomains && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DOMAIN_META.map(d => {
                const v = test.domains?.[d.id];
                const score = getEffectiveDomainScore(v);
                const pct = getEffectiveDomainPct(v);
                if (score == null && pct == null) return null;
                const isCalculated = v?.score == null && score != null;
                return (
                  <div key={d.id} className="bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-lg p-2">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 truncate">
                      {d.name}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {score != null && (
                        <span
                          className="text-base font-black text-[#182235] dark:text-white"
                          title={isCalculated ? 'Calculated via 200 + 600 × (Correct/Total)' : undefined}
                        >
                          {score}
                        </span>
                      )}
                      {pct != null && (
                        <span className="text-xs text-[#6f7b90] dark:text-slate-400">{pct}%</span>
                      )}
                    </div>
                    {v?.correct != null && v?.total != null && (
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

export const TestHistory: React.FC<{
  onEditTest?: (test: SATTest) => void;
  onOpenCompare?: (testId?: string) => void;
  onOpenAddModal?: () => void;
}> = ({ onEditTest, onOpenCompare, onOpenAddModal }) => {
  const { orderedTests, deleteTest, personalBest, resetToSample } = useSAT();
  const [testToDelete, setTestToDelete] = useState<SATTest | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const rows = [...orderedTests].reverse().slice(0, 12);

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
      <div className="px-3.5 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-[#f0f2f5] dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-[#182235] dark:text-slate-100">Recent Tests</h2>
          <p className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">Your saved score history and mistake triage.</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onOpenCompare && (
            <button
              type="button"
              onClick={() => onOpenCompare()}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-xs cursor-pointer"
              title="Compare any two tests side-by-side"
            >
              <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Compare</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              isCompact
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-[#6f7b90] dark:text-slate-300 border-[#e5e9f0] dark:border-slate-700 hover:bg-[#f6f8fb]'
            }`}
            title="Toggle compact table view"
          >
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{isCompact ? 'Compact' : 'Standard'}</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-[#6f7b90] dark:text-slate-300 bg-[#eef2f7] dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
            {orderedTests.length}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 sm:py-12 px-4 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#eef2f7] dark:bg-slate-800 flex items-center justify-center mb-3 text-[#2c4160] dark:text-indigo-400">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-[#182235] dark:text-slate-100">
            No Practice Tests Recorded Yet
          </h3>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1 max-w-sm">
            Log your official College Board Bluebook mock test scores or load our 4 sample tests to see your progress table and mistake triage log.
          </p>
          <div className="flex items-center gap-2 mt-3.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={resetToSample}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-extrabold text-[#182235] bg-amber-300 hover:bg-amber-200 rounded-lg sm:rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Load 4 Sample Tests</span>
            </button>
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:bg-[#f6f8fb] dark:hover:bg-slate-700 rounded-lg sm:rounded-xl transition-all cursor-pointer"
              >
                + Add Test
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Header */}
          <div
            className="grid min-w-[480px] sm:min-w-0 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 border-b border-[#f0f2f5] dark:border-slate-800"
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

          <div className="min-w-[480px] sm:min-w-0">
            {rows.map(test => (
              <TestRow
                key={test.id}
                test={test}
                onRequestDelete={setTestToDelete}
                onEdit={onEditTest}
                onOpenCompare={onOpenCompare}
                isBest={test.total === personalBest}
                isCompact={isCompact}
              />
            ))}
          </div>

          {orderedTests.length > 12 && (
            <div className="px-4 py-2 text-center text-xs text-[#6f7b90] dark:text-slate-400 border-t border-[#f0f2f5] dark:border-slate-800">
              Showing 12 most recent. Export to see all {orderedTests.length}.
            </div>
          )}
        </div>
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
