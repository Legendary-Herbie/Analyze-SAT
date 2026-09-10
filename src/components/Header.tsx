import React from 'react';
import { Plus, BarChart3, Database } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenPlannerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenDataModal,
  onOpenPlannerModal
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#2c4160] flex items-center justify-center text-white font-extrabold text-sm shadow-sm tracking-wide">
          SAT
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#182235] tracking-tight">
            SAT Performance Tracker
          </h1>
          <p className="text-xs text-[#6f7b90] mt-0.5">
            Digital SAT analytics, domain mastery, and score projection
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onOpenPlannerModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2c4160] bg-white border border-[#e5e9f0] rounded-xl hover:bg-[#f6f8fb] transition-colors shadow-sm"
          title="Target score goals and superscore"
        >
          <BarChart3 className="w-4 h-4 text-[#2c4160]" />
          <span>Goal Planner</span>
        </button>

        <button
          onClick={onOpenDataModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#405978] bg-white border border-[#e5e9f0] rounded-xl hover:bg-[#f6f8fb] transition-colors shadow-sm"
        >
          <Database className="w-4 h-4" />
          <span>Data & Export</span>
        </button>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Test</span>
        </button>
      </div>
    </header>
  );
};
