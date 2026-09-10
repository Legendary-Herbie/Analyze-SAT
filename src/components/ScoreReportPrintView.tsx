import React from 'react';
import { X, Printer, Target } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { calculateSuperscorePathways } from '../utils/pathwayCalculator';

interface ScoreReportPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreReportPrintView: React.FC<ScoreReportPrintViewProps> = ({ isOpen, onClose }) => {
  const { tests, orderedTests, latestTest, personalBest, averageScore, superscore, targetScore, domainTrends } = useSAT();

  if (!isOpen) return null;

  const pathwaysResult = calculateSuperscorePathways(superscore, targetScore, domainTrends);
  const primaryPathway = pathwaysResult.pathways[0];

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-black text-[#182235] dark:text-slate-100">
              Student Progress Summary Report
            </h2>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400">
              Formatted for print, PDF export, tutors, and counselor reviews.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="overflow-y-auto p-8 bg-white text-[#182235] space-y-6 print-page font-sans">
          {/* Header of Report */}
          <div className="flex items-start justify-between border-b-2 border-[#182235] pb-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#405978]">
                Official Practice Performance Summary
              </div>
              <h1 className="text-2xl font-black text-[#182235] tracking-tight mt-0.5">
                Digital SAT Analytics Report
              </h1>
              <div className="text-xs text-[#6f7b90] mt-1 flex items-center gap-2">
                <span>Generated: {currentDateStr}</span>
                <span>•</span>
                <span>{tests.length} Practice Tests Evaluated</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-[#2c4160]">
                {superscore?.total ?? '—'}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90]">
                Superscore Composite
              </div>
              <div className="text-xs font-semibold text-[#405978] mt-0.5">
                R&W: {superscore?.rw ?? '—'} | Math: {superscore?.math ?? '—'}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="border border-[#e5e9f0] rounded-xl p-3 bg-[#f8fafc]">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90]">Latest Test</div>
              <div className="text-xl font-black text-[#182235] mt-1">{latestTest?.total ?? '—'}</div>
              <div className="text-[10px] text-[#6f7b90]">{latestTest?.name ?? 'None recorded'}</div>
            </div>

            <div className="border border-[#e5e9f0] rounded-xl p-3 bg-[#f8fafc]">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90]">Personal Best</div>
              <div className="text-xl font-black text-[#182235] mt-1">{personalBest ?? '—'}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Peak single-session</div>
            </div>

            <div className="border border-[#e5e9f0] rounded-xl p-3 bg-[#f8fafc]">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90]">Average Score</div>
              <div className="text-xl font-black text-[#182235] mt-1">{averageScore ?? '—'}</div>
              <div className="text-[10px] text-[#6f7b90]">Mean across tests</div>
            </div>

            <div className="border border-[#e5e9f0] rounded-xl p-3 bg-[#f8fafc]">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90]">Target Goal</div>
              <div className="text-xl font-black text-[#2c4160] mt-1">{targetScore}</div>
              <div className="text-[10px] text-indigo-700 font-bold">
                {targetScore - (superscore?.total ?? 0) <= 0
                  ? 'Goal Met!'
                  : `${targetScore - (superscore?.total ?? 0)} pts to target`}
              </div>
            </div>
          </div>

          {/* Superscore Pathway Strategy */}
          {primaryPathway && (
            <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Recommended Pathway to {targetScore}: {primaryPathway.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {primaryPathway.badge}
                </span>
              </div>
              <p className="text-xs text-[#2c4160] leading-relaxed mt-1">
                {primaryPathway.strategicAdvice}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-indigo-200/60 text-xs">
                <div>
                  <span className="text-[#6f7b90] font-medium">Target R&W: </span>
                  <strong className="text-[#182235]">{primaryPathway.targetRW}</strong>
                  {primaryPathway.deltaRW > 0 && <span className="text-emerald-700 font-bold ml-1">(+{primaryPathway.deltaRW} pts / ~{primaryPathway.questionsNeededRW} Qs)</span>}
                </div>
                <div>
                  <span className="text-[#6f7b90] font-medium">Target Math: </span>
                  <strong className="text-[#182235]">{primaryPathway.targetMath}</strong>
                  {primaryPathway.deltaMath > 0 && <span className="text-emerald-700 font-bold ml-1">(+{primaryPathway.deltaMath} pts / ~{primaryPathway.questionsNeededMath} Qs)</span>}
                </div>
              </div>
            </div>
          )}

          {/* Domain Breakdown Table */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#182235] mb-2">
              Domain Mastery & Weakness Analysis
            </div>
            <div className="border border-[#e5e9f0] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_1fr] bg-[#f8fafc] px-3 py-2 text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] border-b border-[#e5e9f0]">
                <span>Domain</span>
                <span>Section</span>
                <span>Latest Accuracy</span>
                <span>Assessment</span>
              </div>
              {domainTrends.map(dt => (
                <div
                  key={dt.domain.id}
                  className="grid grid-cols-[1.5fr_0.8fr_0.8fr_1fr] px-3 py-2 text-xs border-b border-[#f0f2f5] last:border-b-0 items-center"
                >
                  <span className="font-bold text-[#182235]">{dt.domain.name}</span>
                  <span className="text-[#6f7b90]">{dt.domain.section === 'rw' ? 'Reading & Writing' : 'Math'}</span>
                  <span className="font-semibold text-[#182235]">{dt.latestPct != null ? `${dt.latestPct}%` : '—'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block w-fit ${
                    dt.assessment === 'Major strength' ? 'bg-emerald-100 text-emerald-800' :
                    dt.assessment === 'Strong' ? 'bg-blue-100 text-blue-800' :
                    dt.assessment === 'Developing' ? 'bg-amber-100 text-amber-800' :
                    dt.assessment === 'Priority area' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {dt.assessment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Test History */}
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-[#182235] mb-2">
              Recorded Test History Log
            </div>
            <div className="border border-[#e5e9f0] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-[#f8fafc] px-3 py-2 text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] border-b border-[#e5e9f0]">
                <span>Test Name</span>
                <span>Date</span>
                <span>Total</span>
                <span>R&W</span>
                <span>Math</span>
              </div>
              {orderedTests.map(t => (
                <div
                  key={t.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-3 py-2 text-xs border-b border-[#f0f2f5] last:border-b-0"
                >
                  <span className="font-bold text-[#182235]">{t.name}</span>
                  <span className="text-[#6f7b90]">{t.date || '—'}</span>
                  <span className="font-black text-[#2c4160]">{t.total}</span>
                  <span className="text-[#405978]">{t.rw}</span>
                  <span className="text-[#405978]">{t.math}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-[#e5e9f0] text-center text-[10px] text-[#6f7b90]">
            Report generated from student's local SAT tracker. Prepared for college admissions planning and targeted test preparation.
          </div>
        </div>
      </div>
    </div>
  );
};
