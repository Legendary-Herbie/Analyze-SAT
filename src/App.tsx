import { useState } from 'react';
import { SATProvider } from './context/SATContext';
import { Header } from './components/Header';
import { HeroSummary } from './components/HeroSummary';
import { ScoreTrendsChart } from './components/ScoreTrendsChart';
import { DomainAnalysis } from './components/DomainAnalysis';
import { PerformanceInsights } from './components/PerformanceInsights';
import { TestHistory } from './components/TestHistory';
import { TestModal } from './components/TestModal';
import { DataModal } from './components/DataModal';
import { GoalPlannerModal } from './components/GoalPlannerModal';

function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);

  return (
    <SATProvider>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 pt-6">
        <Header
          onOpenAddModal={() => setShowAddModal(true)}
          onOpenDataModal={() => setShowDataModal(true)}
          onOpenPlannerModal={() => setShowPlannerModal(true)}
        />

        <HeroSummary />
        <ScoreTrendsChart />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.85fr)] gap-5 mt-5">
          <div className="flex flex-col gap-5">
            <DomainAnalysis />
            <TestHistory />
          </div>
          <PerformanceInsights />
        </div>

        <p className="text-center text-[11px] text-[#6f7b90] mt-8">
          All data is stored locally in your browser — nothing is uploaded to any server.
        </p>
      </div>

      <TestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <DataModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
      />
      <GoalPlannerModal
        isOpen={showPlannerModal}
        onClose={() => setShowPlannerModal(false)}
      />
    </SATProvider>
  );
}

export default App;
