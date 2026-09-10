import { useState } from 'react';
import { SATProvider } from './context/SATContext';
import { Header } from './components/Header';
import { HeroSummary } from './components/HeroSummary';
import { ScoreTrendsChart } from './components/ScoreTrendsChart';
import { DomainAnalysis } from './components/DomainAnalysis';
import { PerformanceInsights } from './components/PerformanceInsights';
import { TestHistory } from './components/TestHistory';
import { TestTimelineCard } from './components/TestTimelineCard';
import { TestModal } from './components/TestModal';
import { DataModal } from './components/DataModal';
import { GoalPlannerModal } from './components/GoalPlannerModal';
import { ModuleSimulatorModal } from './components/ModuleSimulatorModal';
import { ScoreReportImporterModal } from './components/ScoreReportImporterModal';
import { ScoreReportPrintView } from './components/ScoreReportPrintView';
import { SATTest } from './types/sat';

function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showImporterModal, setShowImporterModal] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [editingTest, setEditingTest] = useState<SATTest | null>(null);

  const handleOpenEdit = (test: SATTest) => {
    setEditingTest(test);
    setShowAddModal(true);
  };

  const handleCloseTestModal = () => {
    setShowAddModal(false);
    setEditingTest(null);
  };

  return (
    <SATProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-[#182235] dark:text-slate-100 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 pt-6">
          <Header
            onOpenAddModal={() => setShowAddModal(true)}
            onOpenDataModal={() => setShowDataModal(true)}
            onOpenPlannerModal={() => setShowPlannerModal(true)}
            onOpenSimulatorModal={() => setShowSimulatorModal(true)}
            onOpenImporterModal={() => setShowImporterModal(true)}
            onOpenPrintReport={() => setShowPrintReport(true)}
          />

          <HeroSummary />

          {/* Timeline Countdown & Pacing Milestones */}
          <TestTimelineCard />

          <ScoreTrendsChart onOpenAddModal={() => setShowAddModal(true)} />

          {/* Performance Insights */}
          <div className="mt-5">
            <PerformanceInsights />
          </div>

          {/* Domain Analysis (comes after Performance Insights) */}
          <div className="mt-5">
            <DomainAnalysis />
          </div>

          {/* Test History */}
          <div className="mt-5">
            <TestHistory onEditTest={handleOpenEdit} />
          </div>

          <p className="text-center text-[11px] text-[#6f7b90] dark:text-slate-500 mt-8 no-print">
            All data is stored locally in your browser — private, secure, and offline-capable.
          </p>
        </div>

        {/* Modals */}
        <TestModal
          isOpen={showAddModal}
          onClose={handleCloseTestModal}
          editTest={editingTest}
        />
        <DataModal
          isOpen={showDataModal}
          onClose={() => setShowDataModal(false)}
        />
        <GoalPlannerModal
          isOpen={showPlannerModal}
          onClose={() => setShowPlannerModal(false)}
        />
        <ModuleSimulatorModal
          isOpen={showSimulatorModal}
          onClose={() => setShowSimulatorModal(false)}
        />
        <ScoreReportImporterModal
          isOpen={showImporterModal}
          onClose={() => setShowImporterModal(false)}
        />
        <ScoreReportPrintView
          isOpen={showPrintReport}
          onClose={() => setShowPrintReport(false)}
        />
      </div>
    </SATProvider>
  );
}

export default App;
