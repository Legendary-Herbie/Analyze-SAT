import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, ArrowRight, Lightbulb, Compass } from 'lucide-react';
import { simulateModuleRouting } from '../utils/moduleRouting';

interface ModuleSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModuleSimulatorModal: React.FC<ModuleSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [section, setSection] = useState<'rw' | 'math'>('math');
  const [m1Correct, setM1Correct] = useState<number>(16);
  const [m2Correct, setM2Correct] = useState<number>(15);

  if (!isOpen) return null;

  const maxM1 = section === 'rw' ? 27 : 22;
  const maxM2 = section === 'rw' ? 27 : 22;

  const validM1 = Math.min(maxM1, Math.max(0, m1Correct));
  const validM2 = Math.min(maxM2, Math.max(0, m2Correct));

  const simulation = simulateModuleRouting(section, validM1, validM2);

  const handleSectionSwitch = (sec: 'rw' | 'math') => {
    setSection(sec);
    if (sec === 'rw') {
      setM1Correct(20);
      setM2Correct(18);
    } else {
      setM1Correct(16);
      setM2Correct(15);
    }
  };

  const m1Pct = Math.round((validM1 / maxM1) * 100);
  const thresholdPct = Math.round((simulation.m1Threshold / maxM1) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.6)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1.5">
              <Compass className="w-3 h-3" />
              Digital SAT Adaptive Engine
            </div>
            <h2 className="text-xl font-black text-[#182235] dark:text-slate-100">
              Module 2 Routing Simulator
            </h2>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">
              Test how Module 1 performance dictates your Module 2 difficulty and scaled score ceiling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* Section Selector */}
          <div className="flex items-center justify-between bg-[#f6f8fb] dark:bg-slate-800/60 p-1.5 rounded-xl border border-[#e5e9f0] dark:border-slate-700">
            <button
              onClick={() => handleSectionSwitch('math')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                section === 'math'
                  ? 'bg-white dark:bg-slate-700 text-[#182235] dark:text-white shadow-sm'
                  : 'text-[#6f7b90] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white'
              }`}
            >
              Math Section (22 Qs / Module)
            </button>
            <button
              onClick={() => handleSectionSwitch('rw')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                section === 'rw'
                  ? 'bg-white dark:bg-slate-700 text-[#182235] dark:text-white shadow-sm'
                  : 'text-[#6f7b90] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white'
              }`}
            >
              Reading & Writing (27 Qs / Module)
            </button>
          </div>

          {/* Interactive Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Module 1 Slider */}
            <div className="bg-[#f6f8fb] dark:bg-slate-800/50 border border-[#e5e9f0] dark:border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                  Module 1 Correct
                </span>
                <span className="text-base font-black text-[#182235] dark:text-white">
                  {validM1} / {maxM1} ({m1Pct}%)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={maxM1}
                value={validM1}
                onChange={e => setM1Correct(Number(e.target.value))}
                className="w-full accent-[#2c4160] dark:accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] text-[#6f7b90] dark:text-slate-400 mt-2">
                <span>0</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Cutoff: ~{simulation.m1Threshold} ({thresholdPct}%)
                </span>
                <span>{maxM1}</span>
              </div>
            </div>

            {/* Module 2 Slider */}
            <div className="bg-[#f6f8fb] dark:bg-slate-800/50 border border-[#e5e9f0] dark:border-slate-700/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                  Module 2 Correct
                </span>
                <span className="text-base font-black text-[#182235] dark:text-white">
                  {validM2} / {maxM2} ({Math.round((validM2 / maxM2) * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={maxM2}
                value={validM2}
                onChange={e => setM2Correct(Number(e.target.value))}
                className="w-full accent-[#2c4160] dark:accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] text-[#6f7b90] dark:text-slate-400 mt-2">
                <span>0</span>
                <span>Adaptive Difficulty</span>
                <span>{maxM2}</span>
              </div>
            </div>
          </div>

          {/* Routing Decision Banner */}
          <div className={`p-4 rounded-xl border ${simulation.statusColor}`}>
            <div className="flex items-start gap-3">
              {simulation.isHardModuleUnlocked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-black">{simulation.statusBadge}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">
                    Score Ceiling: {simulation.scoreCeiling}
                  </span>
                </div>
                <p className="text-xs mt-1.5 opacity-90 leading-relaxed">
                  {simulation.isHardModuleUnlocked
                    ? `With ${validM1}/${maxM1} in Module 1, you comfortably exceeded the ~${simulation.m1Threshold} question threshold. The algorithm will route you into the harder Module 2, giving you full access to the 800 score band.`
                    : `With ${validM1}/${maxM1} in Module 1, you fell below the ~${simulation.m1Threshold} question threshold. You will receive the easier Module 2, which caps your section score at ~${simulation.scoreCeiling} even if you score 100% on Module 2.`}
                </p>
              </div>
            </div>
          </div>

          {/* Scaled Score Outcome */}
          <div className="bg-[#f6f8fb] dark:bg-slate-800/40 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 block">
                Estimated Scaled Section Score
              </span>
              <div className="text-2xl font-black text-[#182235] dark:text-white mt-0.5">
                {simulation.estimatedScoreMin} – {simulation.estimatedScoreMax}
                <span className="text-xs font-bold text-[#6f7b90] dark:text-slate-400 ml-2 font-normal">
                  / 800
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 block">
                Total Operational Questions Correct
              </span>
              <div className="text-base font-bold text-[#2c4160] dark:text-indigo-400">
                {validM1 + validM2} / {maxM1 + maxM2}
              </div>
            </div>
          </div>

          {/* Strategic Advice */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#182235] dark:text-slate-200 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Tactical Test Day Strategies
            </div>
            <div className="space-y-2">
              {simulation.advice.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700/80 text-xs text-[#405978] dark:text-slate-300"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#2c4160] dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/90">
          <span className="text-[11px] text-[#6f7b90] dark:text-slate-500">
            Based on College Board official Digital SAT multi-stage adaptive scoring rubrics.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
