import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useSAT } from '../context/SATContext';

interface GoalPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalPlannerModal: React.FC<GoalPlannerModalProps> = ({ isOpen, onClose }) => {
  const { targetScore, setTargetScore, latestTest, personalBest, superscore, averageScore } = useSAT();
  const [inputVal, setInputVal] = useState(String(targetScore));

  useEffect(() => {
    setInputVal(String(targetScore));
  }, [isOpen, targetScore]);

  const handleSave = () => {
    const val = Number(inputVal);
    if (val >= 400 && val <= 1600) {
      setTargetScore(val);
      onClose();
    }
  };

  const current = latestTest?.total ?? 0;
  const needed = Math.max(0, targetScore - current);
  const progressPct = current > 0 ? Math.min(100, Math.round((current / targetScore) * 100)) : 0;

  const breakdownRW = Math.ceil(targetScore / 2 / 10) * 10;
  const breakdownMath = targetScore - breakdownRW;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(18,24,40,0.45)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_26px_90px_rgba(0,0,0,0.22)] overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0]">
          <div>
            <h2 className="text-xl font-black text-[#182235]">Goal Planner</h2>
            <p className="text-xs text-[#6f7b90] mt-1">Set your target score and track your progress.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#eef2f7] hover:bg-[#e5e9f0] flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#405978]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Target input */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#6f7b90] block mb-2">
              Target Score (400–1600)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={400} max={1600} step={10}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="flex-1 border border-[#e5e9f0] rounded-xl px-3 py-2.5 text-xl font-black text-[#182235] focus:outline-none focus:border-[#2c4160] focus:ring-2 focus:ring-[#2c4160]/10"
              />
              <div className="text-xs text-[#6f7b90] text-center">
                <div className="font-bold text-[#182235]">{breakdownRW}</div>
                <div>R&W</div>
              </div>
              <div className="text-[#6f7b90]">+</div>
              <div className="text-xs text-[#6f7b90] text-center">
                <div className="font-bold text-[#182235]">{breakdownMath}</div>
                <div>Math</div>
              </div>
            </div>
            <input
              type="range" min={400} max={1600} step={10}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="w-full mt-3 accent-[#2c4160]"
            />
            <div className="flex justify-between text-[10px] text-[#6f7b90] mt-1">
              <span>400</span><span>800</span><span>1200</span><span>1600</span>
            </div>
          </div>

          {/* Progress bars */}
          {latestTest && (
            <div className="space-y-3 pt-1">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90]">Current Progress</div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#6f7b90]">Current Score</span>
                  <span className="font-extrabold text-[#182235]">{current} / {targetScore}</span>
                </div>
                <div className="w-full h-3 bg-[#eef1f5] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${current >= Number(inputVal) ? 'bg-emerald-500' : 'bg-[#2c4160]'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="text-xs text-[#6f7b90] mt-1">
                  {current >= Number(inputVal)
                    ? '🎉 Goal reached! Consider raising your target.'
                    : `${needed} more points needed (${progressPct}% there)`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { label: 'Personal Best', value: personalBest },
                  { label: 'Average Score', value: averageScore },
                  { label: 'Superscore', value: superscore?.total },
                  { label: 'Points to Goal', value: needed > 0 ? `+${needed}` : '✓ Done' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f6f8fb] border border-[#e5e9f0] rounded-xl p-3">
                    <div className="text-[10px] text-[#6f7b90] font-bold uppercase tracking-wider">{label}</div>
                    <div className="text-xl font-black text-[#182235] mt-1">{value ?? '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e9f0] bg-[#fafbfc]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#405978] bg-white border border-[#e5e9f0] hover:bg-[#f6f8fb] rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] rounded-xl transition-all active:scale-95 shadow-md">
            <Target className="w-4 h-4" />
            Set Goal
          </button>
        </div>
      </div>
    </div>
  );
};
