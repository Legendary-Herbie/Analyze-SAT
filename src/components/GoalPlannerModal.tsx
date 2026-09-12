import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle2, Check, ArrowRight } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { calculateSuperscorePathways } from '../utils/pathwayCalculator';

interface GoalPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCORE_PRESETS = [1200, 1300, 1400, 1450, 1500, 1550];

export const GoalPlannerModal: React.FC<GoalPlannerModalProps> = ({ isOpen, onClose }) => {
  const { targetScore, setTargetScore, latestTest, superscore, domainTrends } = useSAT();
  const [inputVal, setInputVal] = useState(String(targetScore));
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('math-leverage');

  useEffect(() => {
    setInputVal(String(targetScore));
  }, [isOpen, targetScore]);

  const numTarget = Math.max(400, Math.min(1600, Number(inputVal) || targetScore));
  const currentBaseline = superscore?.total ?? latestTest?.total ?? 1000;
  const currentMath = superscore?.math ?? latestTest?.math ?? 500;
  const currentRW = superscore?.rw ?? latestTest?.rw ?? 500;
  const pointsNeeded = Math.max(0, numTarget - currentBaseline);
  const isGoalMet = pointsNeeded === 0;

  const pathwaysResult = calculateSuperscorePathways(superscore, numTarget, domainTrends);

  const handleSave = () => {
    const val = Number(inputVal);
    if (val >= 400 && val <= 1600) {
      setTargetScore(val);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100">
                Target Score & Section Pathways
              </h2>
              <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                Adjust your goal to see the exact section points needed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Target Score Selector */}
          <div className="bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e5e9f0] dark:border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 block">
                  Target Score
                </label>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-[#182235] dark:text-white">{numTarget}</span>
                  <span className="text-xs font-semibold text-[#6f7b90] dark:text-slate-400">
                    {isGoalMet ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Met by current baseline ({currentBaseline})
                      </span>
                    ) : (
                      <span>
                        +{pointsNeeded} pts from current baseline ({currentBaseline})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <input
                type="number"
                min={400}
                max={1600}
                step={10}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-24 text-center font-black text-lg py-1.5 px-2 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl text-[#182235] dark:text-white"
              />
            </div>

            {/* Slider */}
            <input
              type="range"
              min={400}
              max={1600}
              step={10}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="w-full mt-3 accent-indigo-600 dark:accent-indigo-400 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f7b90] dark:text-slate-500 mr-1">
                Quick Goals:
              </span>
              {SCORE_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputVal(String(preset))}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    numTarget === preset
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-[#405978] dark:text-slate-300 border-[#e5e9f0] dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Section Pathways Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#182235] dark:text-slate-300">
                Actionable Pathways to {numTarget}
              </h3>
              <span className="text-[11px] font-semibold text-[#6f7b90] dark:text-slate-400">
                Baseline: R&W {currentRW} · Math {currentMath}
              </span>
            </div>

            {isGoalMet ? (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="font-extrabold text-sm">Target Already Hit!</div>
                  Your best composite of {currentBaseline} already meets this goal. Set a higher target above to view step-by-step point requirements.
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pathwaysResult.pathways.map(p => {
                  const isSelected = selectedPathwayId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPathwayId(p.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20'
                          : 'border-[#e5e9f0] dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-[#cbd5e1] dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#182235] dark:text-white">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[#405978] dark:text-slate-300">
                            {p.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      {/* Side-by-side section targets */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-lg bg-[#f8fafc] dark:bg-slate-800 border border-[#eef2f7] dark:border-slate-700/70">
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="font-bold text-[#405978] dark:text-slate-400">Reading & Writing</span>
                            <span className="font-extrabold text-[#182235] dark:text-white">{p.targetRW}</span>
                          </div>
                          <div className="text-[11px] font-semibold">
                            {p.deltaRW > 0 ? (
                              <span className="text-indigo-600 dark:text-indigo-400">+{p.deltaRW} pts needed</span>
                            ) : (
                              <span className="text-[#6f7b90] dark:text-slate-400">Maintain current</span>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#f8fafc] dark:bg-slate-800 border border-[#eef2f7] dark:border-slate-700/70">
                          <div className="flex items-center justify-between text-[11px] mb-0.5">
                            <span className="font-bold text-[#405978] dark:text-slate-400">Math</span>
                            <span className="font-extrabold text-[#182235] dark:text-white">{p.targetMath}</span>
                          </div>
                          <div className="text-[11px] font-semibold">
                            {p.deltaMath > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400">+{p.deltaMath} pts needed</span>
                            ) : (
                              <span className="text-[#6f7b90] dark:text-slate-400">Maintain current</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Brief strategic takeaway */}
                      <div className="mt-2 text-[11px] text-[#6f7b90] dark:text-slate-400 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{p.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-[#405978] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Target ({numTarget})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
