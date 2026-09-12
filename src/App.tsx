import { useState } from 'react';
import { SATProvider } from './context/SATContext';
import { Header } from './components/Header';
import { NavigationTabs, MainTabType } from './components/NavigationTabs';
import { HeroSummary } from './components/HeroSummary';
import { ScoreTrendsChart } from './components/ScoreTrendsChart';
import { DomainAnalysis } from './components/DomainAnalysis';
import { PerformanceInsights } from './components/PerformanceInsights';
import { TestHistory } from './components/TestHistory';
import { StudyPlanner } from './components/StudyPlanner';
import { TestModal } from './components/TestModal';
import { DataModal } from './components/DataModal';
import { GoalPlannerModal } from './components/GoalPlannerModal';
import { ScoreReportImporterModal } from './components/ScoreReportImporterModal';
import { ScoreReportPrintView } from './components/ScoreReportPrintView';
import { NextBestActionWidget } from './components/NextBestActionWidget';
import { CompareTestsModal } from './components/CompareTestsModal';
import { SATTest } from './types/sat';

function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>(() => {
    try {
      const saved = localStorage.getItem('satTrackerActiveTab');
      if (saved && ['overview', 'planner', 'domains', 'insights', 'history', 'all'].includes(saved)) {
        return saved as MainTabType;
      }
    } catch (e) {
      console.error('Failed to load active tab from storage', e);
    }
    return 'overview';
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [showImporterModal, setShowImporterModal] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareTestAId, setCompareTestAId] = useState<string | null>(null);
  const [compareTestBId, setCompareTestBId] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<SATTest | null>(null);

  const handleTabChange = (tab: MainTabType) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('satTrackerActiveTab', tab);
    } catch (e) {
      console.error('Failed to save active tab to storage', e);
    }
  };

  const handleOpenEdit = (test: SATTest) => {
    setEditingTest(test);
    setShowAddModal(true);
  };

  const handleOpenCompare = (testAId?: string, testBId?: string) => {
    if (testAId) {
      setCompareTestAId(testAId);
    }
    if (testBId) {
      setCompareTestBId(testBId);
    }
    setShowCompareModal(true);
  };

  const handleCloseTestModal = () => {
    setShowAddModal(false);
    setEditingTest(null);
  };

  const handleScheduleDrill = (domainId: string) => {
    handleTabChange('planner');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-schedule-drill', { detail: { domainId } }));
    }, 60);
  };

  return (
    <SATProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-[#182235] dark:text-slate-100 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-16 pt-6">
          <Header
            onOpenAddModal={() => setShowAddModal(true)}
            onOpenDataModal={() => setShowDataModal(true)}
            onOpenPlannerModal={() => setShowPlannerModal(true)}
            onOpenImporterModal={() => setShowImporterModal(true)}
            onOpenPrintReport={() => setShowPrintReport(true)}
            onOpenCompareModal={() => handleOpenCompare()}
          />

          {/* Navigation Tabs for clean uncluttered layout */}
          <NavigationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Tab 1: Overview & Trends */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <HeroSummary onOpenGoalPlanner={() => setShowPlannerModal(true)} />
              <NextBestActionWidget
                onNavigateTab={(t) => handleTabChange(t as MainTabType)}
                onOpenGoalPlanner={() => setShowPlannerModal(true)}
              />
              <ScoreTrendsChart
                onOpenAddModal={() => setShowAddModal(true)}
                onOpenCompare={handleOpenCompare}
              />
            </div>
          )}

          {/* Tab 2: Study Planner */}
          {activeTab === 'planner' && (
            <div className="animate-in fade-in duration-200">
              <StudyPlanner />
            </div>
          )}

          {/* Tab 3: Domain Mastery */}
          {activeTab === 'domains' && (
            <div className="animate-in fade-in duration-200">
              <DomainAnalysis onScheduleDrill={handleScheduleDrill} />
            </div>
          )}

          {/* Tab 4: Score Insights & Pathways */}
          {activeTab === 'insights' && (
            <div className="animate-in fade-in duration-200">
              <PerformanceInsights />
            </div>
          )}

          {/* Tab 5: Test History */}
          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-200">
              <TestHistory onEditTest={handleOpenEdit} onOpenCompare={handleOpenCompare} />
            </div>
          )}

          {/* Tab 6: Full View (All sections stacked) */}
          {activeTab === 'all' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <HeroSummary onOpenGoalPlanner={() => setShowPlannerModal(true)} />
              <NextBestActionWidget
                onNavigateTab={(t) => handleTabChange(t as MainTabType)}
                onOpenGoalPlanner={() => setShowPlannerModal(true)}
              />
              <StudyPlanner />
              <ScoreTrendsChart
                onOpenAddModal={() => setShowAddModal(true)}
                onOpenCompare={handleOpenCompare}
              />
              <PerformanceInsights />
              <DomainAnalysis onScheduleDrill={handleScheduleDrill} />
              <TestHistory onEditTest={handleOpenEdit} onOpenCompare={handleOpenCompare} />
            </div>
          )}

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
        <ScoreReportImporterModal
          isOpen={showImporterModal}
          onClose={() => setShowImporterModal(false)}
        />
        <ScoreReportPrintView
          isOpen={showPrintReport}
          onClose={() => setShowPrintReport(false)}
        />
        {showCompareModal && (
          <CompareTestsModal
            isOpen={showCompareModal}
            onClose={() => {
              setShowCompareModal(false);
              setCompareTestAId(null);
              setCompareTestBId(null);
            }}
            initialTestAId={compareTestAId}
            initialTestBId={compareTestBId}
            onOpenAddModal={() => setShowAddModal(true)}
          />
        )}
      </div>
    </SATProvider>
  );
}

export default App;
