import React, { useState, useEffect } from 'react';
import { X, Target, Sparkles } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { calculateSuperscorePathways } from '../utils/pathwayCalculator';

interface GoalPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalPlannerModal: React.FC<GoalPlannerModalProps> = ({ isOpen, onClose }) => {
  const { targetScore, setTargetScore, latestTest, personalBest, superscore, averageScore, domainTrends } = useSAT();
  const [inputVal, setInputVal] = useState(String(targetScore));
  const [activeTab, setActiveTab] = useState<'pathways' | 'goal'>('pathways');
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('math-leverage');

  useEffect(() => {
    setInputVal(String(targetScore));
  }, [isOpen, targetScore]);

  const numTarget = Number(inputVal) || targetScore;
  const current = latestTest?.total ?? 0;
  const currentSuperscore = superscore?.total ?? current;
  const needed = Math.max(0, numTarget - currentSuperscore);
  const progressPct = currentSuperscore > 0 ? Math.min(100, Math.round((currentSuperscore / numTarget) * 100)) : 0;

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
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-1.5">
              <Sparkles className="w-3 h-3" />
              Strategic Score Optimizer
            </div>
            <h2 className="text-xl font-black text-[#182235] dark:text-slate-100">
              Goal Planner & Superscore Pathways
            </h2>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">
              Find the highest-probability route to hitting your target composite score.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/60 gap-4">
          <button
            onClick={() => setActiveTab('pathways')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'pathways'
                ? 'text-[#2c4160] dark:text-indigo-400 border-[#2c4160] dark:border-indigo-400'
                : 'text-[#6f7b90] dark:text-slate-400 border-transparent hover:text-[#182235] dark:hover:text-slate-200'
            }`}
          >
            Superscore Pathway Calculator
          </button>
          <button
            onClick={() => setActiveTab('goal')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'goal'
                ? 'text-[#2c4160] dark:text-indigo-400 border-[#2c4160] dark:border-indigo-400'
                : 'text-[#6f7b90] dark:text-slate-400 border-transparent hover:text-[#182235] dark:hover:text-slate-200'
            }`}
          >
            Target Settings & Milestone Stats
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Target Score Slider Control (Always visible to experiment) */}
          <div className="bg-[#f6f8fb] dark:bg-slate-800/50 border border-[#e5e9f0] dark:border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 block">
                  Target Composite Score
                </label>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-[#182235] dark:text-white">{numTarget}</span>
                  <span className="text-xs text-[#6f7b90] dark:text-slate-400">
                    ({needed > 0 ? `+${needed} pts needed from superscore ${currentSuperscore}` : 'Target achieved!'})
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

            <input
              type="range"
              min={400}
              max={1600}
              step={10}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="w-full mt-3 accent-[#2c4160] dark:accent-indigo-400"
            />
            <div className="flex justify-between text-[10px] text-[#6f7b90] dark:text-slate-400 mt-1">
              <span>400</span>
              <span>1000</span>
              <span>1200</span>
              <span>1400</span>
              <span>1600</span>
            </div>
          </div>

          {activeTab === 'pathways' ? (
            <div className="space-y-4">
              {/* Headroom Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700">
                  <div className="text-[10px] font-extrabold uppercase text-[#6f7b90] dark:text-slate-400">
                    Math Headroom (Max 800)
                  </div>
                  <div className="text-base font-black text-[#2c4160] dark:text-indigo-400 mt-0.5">
                    {superscore?.math ?? 500} / 800{' '}
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      (+{pathwaysResult.mathHeadroom} pts room)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700">
                  <div className="text-[10px] font-extrabold uppercase text-[#6f7b90] dark:text-slate-400">
                    R&W Headroom (Max 800)
                  </div>
                  <div className="text-base font-black text-[#2c4160] dark:text-indigo-400 mt-0.5">
                    {superscore?.rw ?? 500} / 800{' '}
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      (+{pathwaysResult.rwHeadroom} pts room)
                    </span>
                  </div>
                </div>
              </div>

              {/* Pathway Options */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                  Calculated Pathways to {numTarget}
                </div>

                {pathwaysResult.pathways.map(p => {
                  const isSelected = selectedPathwayId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPathwayId(p.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#2c4160] dark:border-indigo-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-[#2c4160]/20 dark:ring-indigo-500/30'
                          : 'border-[#e5e9f0] dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-[#c8d0db] dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#182235] dark:text-white">
                              {p.name}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 block">
                            Target Mix
                          </span>
                          <span className="text-xs font-black text-[#2c4160] dark:text-indigo-400">
                            {p.targetRW} R&W + {p.targetMath} M
                          </span>
                        </div>
                      </div>

                      {/* Gains breakdown */}
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#f0f2f5] dark:border-slate-700/80 text-xs">
                        <div className="bg-[#f6f8fb] dark:bg-slate-800 p-2.5 rounded-lg">
                          <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 block">
                            Math Target: {p.targetMath}
                          </span>
                          <div className="font-bold text-[#182235] dark:text-slate-200 mt-0.5">
                            {p.deltaMath > 0 ? `+${p.deltaMath} pts (~${p.questionsNeededMath} more Qs)` : 'Maintain current'}
                          </div>
                        </div>

                        <div className="bg-[#f6f8fb] dark:bg-slate-800 p-2.5 rounded-lg">
                          <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 block">
                            R&W Target: {p.targetRW}
                          </span>
                          <div className="font-bold text-[#182235] dark:text-slate-200 mt-0.5">
                            {p.deltaRW > 0 ? `+${p.deltaRW} pts (~${p.questionsNeededRW} more Qs)` : 'Maintain current'}
                          </div>
                        </div>
                      </div>

                      {/* Strategic Advice */}
                      <div className="mt-2.5 text-xs text-[#405978] dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-[#f0f2f5] dark:border-slate-700/50">
                        💡 {p.strategicAdvice}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Target Goal Progress Tab */
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#6f7b90] dark:text-slate-400">Superscore Progress</span>
                  <span className="font-extrabold text-[#182235] dark:text-white">
                    {currentSuperscore} / {numTarget}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#eef1f5] dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      currentSuperscore >= numTarget ? 'bg-emerald-500' : 'bg-[#2c4160] dark:bg-indigo-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">
                  {currentSuperscore >= numTarget
                    ? '🎉 Goal achieved! Consider aiming for a higher composite score.'
                    : `${needed} more points needed (${progressPct}% there)`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Personal Best', value: personalBest },
                  { label: 'Average Score', value: averageScore },
                  { label: 'Current Superscore', value: superscore?.total },
                  { label: 'Points to Goal', value: needed > 0 ? `+${needed}` : '✓ Done' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-[#f6f8fb] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3"
                  >
                    <div className="text-[10px] text-[#6f7b90] dark:text-slate-400 font-bold uppercase tracking-wider">
                      {label}
                    </div>
                    <div className="text-xl font-black text-[#182235] dark:text-white mt-1">
                      {value ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#405978] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all active:scale-95 shadow-md"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Save Target Score</span>
          </button>
        </div>
      </div>
    </div>
  );
};
