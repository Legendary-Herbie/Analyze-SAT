import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Compass,
  BookOpen,
  Calculator,
  Plus
} from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { SATTest } from '../types/sat';
import { DOMAIN_META, getEffectiveDomainScore, getEffectiveDomainPct } from '../constants/domains';

interface CompareTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTestAId?: string | null;
  initialTestBId?: string | null;
  onOpenAddModal?: () => void;
}

export const CompareTestsModal: React.FC<CompareTestsModalProps> = ({
  isOpen,
  onClose,
  initialTestAId,
  initialTestBId,
  onOpenAddModal
}) => {
  const { orderedTests, resetToSample } = useSAT();
  const [copied, setCopied] = useState(false);
  const [domainFilter, setDomainFilter] = useState<'all' | 'rw' | 'math'>('all');

  // Available tests sorted chronologically
  const sortedTests = useMemo(() => {
    return [...orderedTests].sort((a, b) => {
      const dateA = a.date || '1970-01-01';
      const dateB = b.date || '1970-01-01';
      return dateA.localeCompare(dateB);
    });
  }, [orderedTests]);

  // Default selection: If we have at least 2 tests, Test A = second to last, Test B = latest
  const defaultTestAId = useMemo(() => {
    if (initialTestAId && sortedTests.some(t => t.id === initialTestAId)) {
      return initialTestAId;
    }
    if (sortedTests.length >= 2) {
      return sortedTests[sortedTests.length - 2].id;
    }
    return sortedTests[0]?.id || '';
  }, [sortedTests, initialTestAId]);

  const defaultTestBId = useMemo(() => {
    if (initialTestBId && sortedTests.some(t => t.id === initialTestBId)) {
      return initialTestBId;
    }
    if (sortedTests.length >= 1) {
      return sortedTests[sortedTests.length - 1].id;
    }
    return '';
  }, [sortedTests, initialTestBId]);

  const [testAId, setTestAId] = useState<string>(defaultTestAId);
  const [testBId, setTestBId] = useState<string>(defaultTestBId);

  // Sync state if modal reopens or initial props change
  React.useEffect(() => {
    if (isOpen) {
      if (initialTestAId && sortedTests.some(t => t.id === initialTestAId)) {
        setTestAId(initialTestAId);
      } else if (sortedTests.length >= 2 && !testAId) {
        setTestAId(sortedTests[sortedTests.length - 2].id);
      }

      if (initialTestBId && sortedTests.some(t => t.id === initialTestBId)) {
        setTestBId(initialTestBId);
      } else if (sortedTests.length >= 1 && !testBId) {
        setTestBId(sortedTests[sortedTests.length - 1].id);
      }
    }
  }, [isOpen, initialTestAId, initialTestBId, sortedTests]);

  const testA: SATTest | undefined = sortedTests.find(t => t.id === testAId) || sortedTests[0];
  const testB: SATTest | undefined = sortedTests.find(t => t.id === testBId) || sortedTests[1];

  const handleSwap = () => {
    const temp = testAId;
    setTestAId(testBId);
    setTestBId(temp);
  };

  // Quick preset handlers
  const handlePresetLatestVsPrev = () => {
    if (sortedTests.length >= 2) {
      setTestAId(sortedTests[sortedTests.length - 2].id);
      setTestBId(sortedTests[sortedTests.length - 1].id);
    }
  };

  const handlePresetFirstVsLatest = () => {
    if (sortedTests.length >= 2) {
      setTestAId(sortedTests[0].id);
      setTestBId(sortedTests[sortedTests.length - 1].id);
    }
  };

  const handlePresetBestVsLatest = () => {
    if (sortedTests.length >= 2) {
      const best = [...sortedTests].sort((a, b) => b.total - a.total)[0];
      const latest = sortedTests[sortedTests.length - 1];
      if (best.id === latest.id) {
        // If latest is best, compare second best to latest
        const secondBest = [...sortedTests].sort((a, b) => b.total - a.total)[1];
        setTestAId(secondBest.id);
        setTestBId(latest.id);
      } else {
        setTestAId(best.id);
        setTestBId(latest.id);
      }
    }
  };

  // Deltas calculation
  const totalDelta = (testB?.total ?? 0) - (testA?.total ?? 0);
  const rwDelta = (testB?.rw ?? 0) - (testA?.rw ?? 0);
  const mathDelta = (testB?.math ?? 0) - (testA?.math ?? 0);

  // Time difference in days
  const daysApart = useMemo(() => {
    if (!testA?.date || !testB?.date) return null;
    const d1 = new Date(testA.date).getTime();
    const d2 = new Date(testB.date).getTime();
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff;
  }, [testA?.date, testB?.date]);

  // Mistakes count comparison
  const testAMistakesCount = testA?.mistakes?.length ?? 0;
  const testBMistakesCount = testB?.mistakes?.length ?? 0;
  const mistakesDelta = testBMistakesCount - testAMistakesCount;

  // Domain comparisons
  const filteredDomains = useMemo(() => {
    return DOMAIN_META.filter(d => {
      if (domainFilter === 'rw') return d.section === 'rw';
      if (domainFilter === 'math') return d.section === 'math';
      return true;
    });
  }, [domainFilter]);

  // Generate automated synthesis text
  const synthesis = useMemo(() => {
    if (!testA || !testB) return '';
    const parts: string[] = [];

    if (totalDelta > 0) {
      parts.push(`Overall gain of +${totalDelta} points from ${testA.name} to ${testB.name}.`);
      if (rwDelta > mathDelta && rwDelta > 0) {
        parts.push(`Reading & Writing was the primary growth driver (+${rwDelta} pts), while Math changed by ${mathDelta >= 0 ? `+${mathDelta}` : mathDelta} pts.`);
      } else if (mathDelta > rwDelta && mathDelta > 0) {
        parts.push(`Math was the primary growth driver (+${mathDelta} pts), while Reading & Writing changed by ${rwDelta >= 0 ? `+${rwDelta}` : rwDelta} pts.`);
      } else if (rwDelta === mathDelta && rwDelta > 0) {
        parts.push(`Balanced improvement across both sections (+${rwDelta} pts each).`);
      }
    } else if (totalDelta < 0) {
      parts.push(`Score dip of ${totalDelta} points between tests.`);
      if (rwDelta < 0 && mathDelta >= 0) {
        parts.push(`Drop was concentrated in Reading & Writing (${rwDelta} pts), while Math remained steady (+${mathDelta} pts).`);
      } else if (mathDelta < 0 && rwDelta >= 0) {
        parts.push(`Drop was concentrated in Math (${mathDelta} pts), while Reading & Writing remained steady (+${rwDelta} pts).`);
      } else {
        parts.push(`Declines occurred across both R&W (${rwDelta} pts) and Math (${mathDelta} pts).`);
      }
    } else {
      parts.push(`Identical total score of ${testA.total} on both tests.`);
      if (rwDelta !== 0) {
        parts.push(`Section score trade-off: R&W ${rwDelta > 0 ? `+${rwDelta}` : rwDelta} pts vs Math ${mathDelta > 0 ? `+${mathDelta}` : mathDelta} pts.`);
      }
    }

    // Check routing shifts
    const aRwM2 = testA.moduleRouting?.rwModule2Difficulty;
    const bRwM2 = testB.moduleRouting?.rwModule2Difficulty;
    const aMathM2 = testA.moduleRouting?.mathModule2Difficulty;
    const bMathM2 = testB.moduleRouting?.mathModule2Difficulty;

    if (aRwM2 === 'easy' && bRwM2 === 'hard') {
      parts.push('Crucial milestone: Unlocked the Hard Reading & Writing Module 2 on Test B.');
    }
    if (aMathM2 === 'easy' && bMathM2 === 'hard') {
      parts.push('Crucial milestone: Unlocked the Hard Math Module 2 on Test B.');
    }

    // Mistakes reduction
    if (testAMistakesCount > 0 && testBMistakesCount < testAMistakesCount) {
      parts.push(`Reduced error count by ${Math.abs(mistakesDelta)} logged mistakes.`);
    }

    return parts.join(' ');
  }, [testA, testB, totalDelta, rwDelta, mathDelta, mistakesDelta, testAMistakesCount, testBMistakesCount]);

  const handleCopySummary = () => {
    if (!testA || !testB) return;
    const summaryText = `SAT Score Comparison:
• Test A: ${testA.name} (${testA.date || 'No date'}) - Total: ${testA.total} (RW: ${testA.rw}, Math: ${testA.math})
• Test B: ${testB.name} (${testB.date || 'No date'}) - Total: ${testB.total} (RW: ${testB.rw}, Math: ${testB.math})
• Total Change: ${totalDelta >= 0 ? `+${totalDelta}` : totalDelta} pts
• Section Deltas: R&W ${rwDelta >= 0 ? `+${rwDelta}` : rwDelta} pts | Math ${mathDelta >= 0 ? `+${mathDelta}` : mathDelta} pts
• Synthesis: ${synthesis}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#e5e9f0] dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#182235] dark:text-white">
                Compare Practice Tests
              </h2>
              <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                Visualize score deltas, domain mastery shifts, and adaptive routing side-by-side.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {sortedTests.length < 2 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#182235] dark:text-white">
                At Least Two Tests Required
              </h3>
              <p className="text-xs text-[#6f7b90] dark:text-slate-400 leading-relaxed">
                To compare scores side-by-side and calculate domain progressions, you need at least two recorded practice tests in your history.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetToSample();
                  }}
                  className="px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                >
                  Load Sample Tests
                </button>
                {onOpenAddModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddModal();
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-[#2c4160] dark:bg-indigo-600 rounded-xl hover:bg-[#203047] dark:hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Practice Test</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Preset Selector Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#6f7b90] dark:text-slate-400 mr-1">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={handlePresetLatestVsPrev}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#e5e9f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800 text-[#2c4160] dark:text-indigo-300 hover:bg-[#eef2f7] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Latest vs. Previous
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetFirstVsLatest}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#e5e9f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800 text-[#2c4160] dark:text-indigo-300 hover:bg-[#eef2f7] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    First (Baseline) vs. Latest
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetBestVsLatest}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#e5e9f0] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800 text-[#2c4160] dark:text-indigo-300 hover:bg-[#eef2f7] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Personal Best vs. Latest
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#405978] dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-lg hover:bg-[#f6f8fb] dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Copy comparison summary to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Side-by-Side Test Selectors Card */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-[#f8fafc] dark:bg-slate-800/50 p-4 rounded-2xl border border-[#e5e9f0] dark:border-slate-800">
                {/* Test A Select */}
                <div className="md:col-span-5 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-[#e5e9f0] dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Test A (Baseline / Prior)
                    </span>
                    {testA && (
                      <span className="text-xs font-black text-[#182235] dark:text-white">
                        {testA.total} pts
                      </span>
                    )}
                  </div>
                  <select
                    value={testAId}
                    onChange={(e) => setTestAId(e.target.value)}
                    className="form-input text-xs font-semibold py-1.5 px-2 w-full mb-2 cursor-pointer"
                  >
                    {sortedTests.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.id === testBId}>
                        {t.name} ({t.total} pts · {t.date || 'No date'})
                      </option>
                    ))}
                  </select>
                  {testA && (
                    <div className="flex items-center justify-between text-[11px] text-[#6f7b90] dark:text-slate-400">
                      <span>R&W: <strong className="text-[#182235] dark:text-slate-200">{testA.rw}</strong></span>
                      <span>Math: <strong className="text-[#182235] dark:text-slate-200">{testA.math}</strong></span>
                      <span>{testA.source || 'Standard'}</span>
                    </div>
                  )}
                </div>

                {/* Swap Button in Center */}
                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#405978] dark:text-slate-300 shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title="Swap Test A and Test B"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Test B Select */}
                <div className="md:col-span-5 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-[#e5e9f0] dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Test B (Comparison / Newer)
                    </span>
                    {testB && (
                      <span className="text-xs font-black text-[#182235] dark:text-white">
                        {testB.total} pts
                      </span>
                    )}
                  </div>
                  <select
                    value={testBId}
                    onChange={(e) => setTestBId(e.target.value)}
                    className="form-input text-xs font-semibold py-1.5 px-2 w-full mb-2 cursor-pointer"
                  >
                    {sortedTests.map((t) => (
                      <option key={t.id} value={t.id} disabled={t.id === testAId}>
                        {t.name} ({t.total} pts · {t.date || 'No date'})
                      </option>
                    ))}
                  </select>
                  {testB && (
                    <div className="flex items-center justify-between text-[11px] text-[#6f7b90] dark:text-slate-400">
                      <span>R&W: <strong className="text-[#182235] dark:text-slate-200">{testB.rw}</strong></span>
                      <span>Math: <strong className="text-[#182235] dark:text-slate-200">{testB.math}</strong></span>
                      <span>{testB.source || 'Standard'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total & Section Score Comparison Banner */}
              {testA && testB && (
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-card border border-slate-700/60">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                    
                    {/* Total Score Delta Card */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                        Total Score Change
                      </span>
                      <div className="flex items-center gap-2">
                        {totalDelta > 0 ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                        ) : totalDelta < 0 ? (
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/30">
                            <TrendingDown className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-500/20 text-slate-400 flex items-center justify-center border border-slate-400/30">
                            <Minus className="w-4 h-4" />
                          </div>
                        )}
                        <span className={`text-3xl font-black ${
                          totalDelta > 0 ? 'text-emerald-400' : totalDelta < 0 ? 'text-rose-400' : 'text-slate-300'
                        }`}>
                          {totalDelta > 0 ? `+${totalDelta}` : totalDelta}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">pts</span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-300 flex items-center gap-2">
                        <span>{testA.total}</span>
                        <span>→</span>
                        <span className="font-extrabold text-white">{testB.total}</span>
                        {daysApart != null && daysApart > 0 && (
                          <span className="text-[10px] text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                            {daysApart}d apart
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Section Breakdown: R&W and Math */}
                    <div className="md:col-span-2 space-y-3.5">
                      {/* Reading & Writing bar comparison */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Reading & Writing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{testA.rw} → {testB.rw}</span>
                            <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              rwDelta > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              rwDelta < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-slate-700/50 text-slate-300'
                            }`}>
                              {rwDelta > 0 ? `+${rwDelta}` : rwDelta} pts
                            </span>
                          </div>
                        </div>
                        {/* Relative track */}
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                          <div
                            className="bg-indigo-400/60 h-full transition-all duration-500"
                            style={{ width: `${(testA.rw / 800) * 100}%` }}
                            title={`Test A: ${testA.rw}/800`}
                          />
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex mt-1">
                          <div
                            className="bg-indigo-400 h-full transition-all duration-500"
                            style={{ width: `${(testB.rw / 800) * 100}%` }}
                            title={`Test B: ${testB.rw}/800`}
                          />
                        </div>
                      </div>

                      {/* Math bar comparison */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-200">
                            <Calculator className="w-3.5 h-3.5 text-sky-400" />
                            <span>Math</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{testA.math} → {testB.math}</span>
                            <span className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              mathDelta > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              mathDelta < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-slate-700/50 text-slate-300'
                            }`}>
                              {mathDelta > 0 ? `+${mathDelta}` : mathDelta} pts
                            </span>
                          </div>
                        </div>
                        {/* Relative track */}
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                          <div
                            className="bg-sky-400/60 h-full transition-all duration-500"
                            style={{ width: `${(testA.math / 800) * 100}%` }}
                            title={`Test A: ${testA.math}/800`}
                          />
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex mt-1">
                          <div
                            className="bg-sky-400 h-full transition-all duration-500"
                            style={{ width: `${(testB.math / 800) * 100}%` }}
                            title={`Test B: ${testB.math}/800`}
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Synthesis Note */}
                  {synthesis && (
                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                      <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <span>{synthesis}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Adaptive Routing Comparison (Digital SAT Specific) */}
              {testA && testB && (testA.moduleRouting || testB.moduleRouting) && (
                <div className="p-4 rounded-xl border border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#182235] dark:text-white">
                    <Compass className="w-4 h-4 text-indigo-500" />
                    <span>Adaptive Module 2 Routing Comparison</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* R&W M2 */}
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-[#e5e9f0] dark:border-slate-700">
                      <div className="text-[10px] font-bold uppercase text-[#6f7b90] dark:text-slate-400 mb-1">
                        Reading & Writing Module 2 Stage
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Test A: <strong>{testA.moduleRouting?.rwModule2Difficulty || 'Unspecified'}</strong></span>
                        <span>→</span>
                        <span className={`font-bold ${
                          testB.moduleRouting?.rwModule2Difficulty === 'hard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          Test B: {testB.moduleRouting?.rwModule2Difficulty || 'Unspecified'}
                        </span>
                      </div>
                    </div>

                    {/* Math M2 */}
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-[#e5e9f0] dark:border-slate-700">
                      <div className="text-[10px] font-bold uppercase text-[#6f7b90] dark:text-slate-400 mb-1">
                        Math Module 2 Stage
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Test A: <strong>{testA.moduleRouting?.mathModule2Difficulty || 'Unspecified'}</strong></span>
                        <span>→</span>
                        <span className={`font-bold ${
                          testB.moduleRouting?.mathModule2Difficulty === 'hard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          Test B: {testB.moduleRouting?.mathModule2Difficulty || 'Unspecified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain-by-Domain Side-by-Side Comparison */}
              {testA && testB && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#182235] dark:text-white">
                        Domain-by-Domain Breakdown
                      </h3>
                      <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                        Accuracy and scaled points progression across Digital SAT categories.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center bg-[#f0f2f5] dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDomainFilter('all')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          domainFilter === 'all'
                            ? 'bg-white dark:bg-slate-700 text-[#182235] dark:text-white shadow-xs'
                            : 'text-[#6f7b90] dark:text-slate-400'
                        }`}
                      >
                        All (8)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDomainFilter('rw')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          domainFilter === 'rw'
                            ? 'bg-white dark:bg-slate-700 text-[#182235] dark:text-white shadow-xs'
                            : 'text-[#6f7b90] dark:text-slate-400'
                        }`}
                      >
                        R&W (4)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDomainFilter('math')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          domainFilter === 'math'
                            ? 'bg-white dark:bg-slate-700 text-[#182235] dark:text-white shadow-xs'
                            : 'text-[#6f7b90] dark:text-slate-400'
                        }`}
                      >
                        Math (4)
                      </button>
                    </div>
                  </div>

                  {/* Domain Comparison Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDomains.map(d => {
                      const dataA = testA.domains?.[d.id];
                      const dataB = testB.domains?.[d.id];

                      const scoreA = getEffectiveDomainScore(dataA);
                      const scoreB = getEffectiveDomainScore(dataB);
                      const pctA = getEffectiveDomainPct(dataA);
                      const pctB = getEffectiveDomainPct(dataB);

                      const hasData = scoreA != null || scoreB != null || pctA != null || pctB != null;
                      const deltaScore = scoreA != null && scoreB != null ? scoreB - scoreA : null;
                      const deltaPct = pctA != null && pctB != null ? pctB - pctA : null;

                      return (
                        <div
                          key={d.id}
                          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-[#e5e9f0] dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${d.section === 'rw' ? 'bg-indigo-500' : 'bg-sky-500'}`} />
                                <h4 className="text-xs font-black text-[#182235] dark:text-white">
                                  {d.name}
                                </h4>
                              </div>
                              <span className="text-[10px] text-[#6f7b90] dark:text-slate-400 uppercase font-semibold">
                                {d.section === 'rw' ? 'Reading & Writing' : 'Math'}
                              </span>
                            </div>

                            {/* Delta Pill */}
                            {deltaPct != null ? (
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                                deltaPct > 0
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : deltaPct < 0
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}>
                                {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                                {deltaScore != null && (
                                  <span className="ml-1 text-[9px] font-normal opacity-80">
                                    ({deltaScore > 0 ? `+${deltaScore}` : deltaScore} pts)
                                  </span>
                                )}
                              </span>
                            ) : hasData ? (
                              <span className="text-[10px] text-slate-400">Partial data</span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No domain data</span>
                            )}
                          </div>

                          {/* Side-by-Side Values */}
                          {hasData && (
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-[#f0f2f5] dark:border-slate-800">
                              <div className="bg-[#f8fafc] dark:bg-slate-800/60 p-2 rounded-lg">
                                <span className="text-[9px] font-bold text-[#6f7b90] dark:text-slate-400 block mb-0.5">
                                  Test A
                                </span>
                                <div className="font-extrabold text-[#182235] dark:text-white">
                                  {pctA != null ? `${pctA}%` : 'N/A'}
                                  {dataA?.correct != null && dataA?.total != null && (
                                    <span className="text-[10px] text-[#6f7b90] dark:text-slate-400 font-normal ml-1">
                                      ({dataA.correct}/{dataA.total})
                                    </span>
                                  )}
                                </div>
                                {scoreA != null && (
                                  <div className="text-[10px] text-[#6f7b90] dark:text-slate-400">
                                    {scoreA} scaled pts
                                  </div>
                                )}
                              </div>

                              <div className="bg-[#f8fafc] dark:bg-slate-800/60 p-2 rounded-lg">
                                <span className="text-[9px] font-bold text-[#6f7b90] dark:text-slate-400 block mb-0.5">
                                  Test B
                                </span>
                                <div className="font-extrabold text-[#182235] dark:text-white">
                                  {pctB != null ? `${pctB}%` : 'N/A'}
                                  {dataB?.correct != null && dataB?.total != null && (
                                    <span className="text-[10px] text-[#6f7b90] dark:text-slate-400 font-normal ml-1">
                                      ({dataB.correct}/{dataB.total})
                                    </span>
                                  )}
                                </div>
                                {scoreB != null && (
                                  <div className="text-[10px] text-[#6f7b90] dark:text-slate-400">
                                    {scoreB} scaled pts
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mistake Notebook Comparison if available */}
              {testA && testB && (testAMistakesCount > 0 || testBMistakesCount > 0) && (
                <div className="p-4 rounded-xl border border-[#e5e9f0] dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                      Mistake Notebook Triage
                    </span>
                    <span className={`text-xs font-bold ${
                      mistakesDelta < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {mistakesDelta < 0
                        ? `${Math.abs(mistakesDelta)} fewer errors on Test B!`
                        : mistakesDelta > 0
                        ? `+${mistakesDelta} errors logged on Test B`
                        : 'Identical mistake volume'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <span className="text-[10px] font-bold text-slate-500 block">Test A Mistakes</span>
                      <strong className="text-base text-slate-900 dark:text-white">{testAMistakesCount}</strong>
                      <span className="text-[10px] text-slate-400 ml-1">logged errors</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      <span className="text-[10px] font-bold text-slate-500 block">Test B Mistakes</span>
                      <strong className="text-base text-slate-900 dark:text-white">{testBMistakesCount}</strong>
                      <span className="text-[10px] text-slate-400 ml-1">logged errors</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-[#6f7b90] dark:text-slate-400">
            {sortedTests.length} test{sortedTests.length !== 1 ? 's' : ''} available in history
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
