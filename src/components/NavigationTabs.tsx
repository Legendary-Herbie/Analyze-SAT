import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Target,
  Sparkles,
  History,
  Layers,
} from 'lucide-react';
import { useSAT } from '../context/SATContext';

export type MainTabType = 'overview' | 'planner' | 'domains' | 'insights' | 'history' | 'all';

interface NavigationTabsProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const { tests, latestTest, superscore } = useSAT();
  const [upcomingCount, setUpcomingCount] = useState<number>(0);

  // Read upcoming scheduled study sessions count from localStorage
  useEffect(() => {
    const updateUpcoming = () => {
      try {
        const raw = localStorage.getItem('satTrackerStudySessionsV1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const pending = parsed.filter((s: any) => !s.completed);
            setUpcomingCount(pending.length);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading study sessions count', e);
      }
      setUpcomingCount(0);
    };

    updateUpcoming();
    window.addEventListener('storage', updateUpcoming);
    return () => window.removeEventListener('storage', updateUpcoming);
  }, [activeTab]);

  const tabs: {
    id: MainTabType;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeHighlight?: boolean;
    description: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & Trends',
      shortLabel: 'Overview',
      icon: TrendingUp,
      badge: latestTest ? `${latestTest.total}` : undefined,
      description: 'Score progression and test trajectory',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      shortLabel: 'Planner',
      icon: Calendar,
      badge: upcomingCount > 0 ? `${upcomingCount}` : undefined,
      badgeHighlight: upcomingCount > 0,
      description: 'Practice test schedule & gap drills',
    },
    {
      id: 'domains',
      label: 'Domain Mastery',
      shortLabel: 'Domains',
      icon: Target,
      badge: '8',
      description: 'R&W and Math domain breakdown',
    },
    {
      id: 'insights',
      label: 'Score Insights',
      shortLabel: 'Insights',
      icon: Sparkles,
      badge: superscore ? `${superscore.total}` : undefined,
      description: 'Superscore pathways & diagnostic gaps',
    },
    {
      id: 'history',
      label: 'Test History',
      shortLabel: 'History',
      icon: History,
      badge: tests.length > 0 ? `${tests.length}` : undefined,
      description: 'Complete log of recorded practice tests',
    },
    {
      id: 'all',
      label: 'Full View',
      shortLabel: 'All',
      icon: Layers,
      description: 'Continuous view of all sections',
    },
  ];

  return (
    <nav
      aria-label="Workspace Sections"
      className="sticky top-2 sm:top-3 z-30 mb-3.5 sm:mb-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-[#e5e9f0] dark:border-slate-800 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-xs sm:shadow-sm transition-all"
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs sm:shadow-sm font-extrabold'
                  : 'text-[#506684] dark:text-slate-300 hover:text-[#182235] dark:hover:text-white hover:bg-[#f6f8fb] dark:hover:bg-slate-800/80 font-bold'
              }`}
              title={tab.description}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#6f7b90] dark:text-slate-400 group-hover:text-indigo-600'
                }`}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>

              {tab.badge !== undefined && (
                <span
                  className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.2 rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeHighlight
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-[#eef2f7] dark:bg-slate-800 text-[#405978] dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
