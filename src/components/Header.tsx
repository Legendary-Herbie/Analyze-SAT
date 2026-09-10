import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Database, Moon, Sun, Compass, Sparkles, Printer } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenPlannerModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenImporterModal: () => void;
  onOpenPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenDataModal,
  onOpenPlannerModal,
  onOpenSimulatorModal,
  onOpenImporterModal,
  onOpenPrintReport,
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
            <h1 className="text-xl sm:text-2xl font-black text-[#182235] dark:text-slate-100 tracking-tight">
              SAT Performance Tracker
            </h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              dSAT Adaptive
            </span>
          </div>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            Digital SAT analytics, domain mastery, superscore pathways, and routing simulator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Module 2 Simulator button */}
        <button
          onClick={onOpenSimulatorModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Digital SAT Module 2 Adaptive Routing Simulator"
        >
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Module 2 Simulator</span>
          <span className="sm:hidden">Simulator</span>
        </button>

        {/* Smart Importer button */}
        <button
          onClick={onOpenImporterModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Paste Bluebook score report text"
        >
          <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="hidden sm:inline">Import Report</span>
          <span className="sm:hidden">Import</span>
        </button>

        {/* Goal & Superscore Pathways */}
        <button
          onClick={onOpenPlannerModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#2c4160] dark:text-indigo-300 bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl hover:bg-[#f6f8fb] dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Target score goals and superscore pathways"
        >
          <BarChart3 className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
          <span className="hidden sm:inline">Pathways</span>
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
