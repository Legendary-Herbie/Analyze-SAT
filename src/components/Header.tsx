import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Database, Moon, Sun, Printer, ArrowLeftRight } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenPlannerModal: () => void;
  onOpenPrintReport: () => void;
  onOpenCompareModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenDataModal,
  onOpenPlannerModal,
  onOpenPrintReport,
  onOpenCompareModal,
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('satTrackerTheme') === 'dark' ||
      (!localStorage.getItem('satTrackerTheme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('satTrackerTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('satTrackerTheme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 no-print">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#2c4160] dark:bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md tracking-wide">
          SAT
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#182235] dark:text-slate-100 tracking-tight">
              SAT Performance Tracker
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              dSAT Adaptive
            </span>
          </div>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            Digital SAT analytics, domain mastery, and superscore pathways
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Compare Tests */}
        {onOpenCompareModal && (
          <button
            onClick={onOpenCompareModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm cursor-pointer"
            title="Compare two practice tests side-by-side"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Compare</span>
          </button>
        )}

        {/* Goal & Superscore Pathways */}
        <button
          onClick={onOpenPlannerModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Target score goals and superscore pathways"
        >
          <BarChart3 className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
          <span className="hidden sm:inline">Goals & Pathways</span>
          <span className="sm:hidden">Goals</span>
        </button>

        {/* Print / PDF Summary Report */}
        <button
          onClick={onOpenPrintReport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#405978] dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Export formatted 1-page progress report"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden md:inline">Print Report</span>
        </button>

        {/* Data & Backup */}
        <button
          onClick={onOpenDataModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#405978] dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Backup and JSON data management"
        >
          <Database className="w-4 h-4" />
          <span className="hidden lg:inline">Data</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:bg-[#f6f8fb] dark:hover:bg-slate-700 text-[#405978] dark:text-amber-400 transition-colors shadow-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Add Test Primary Button */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 ml-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Test</span>
        </button>
      </div>
    </header>
  );
};
