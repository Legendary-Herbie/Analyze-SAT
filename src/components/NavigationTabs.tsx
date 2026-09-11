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
    icon: React.ElementType;
    badge?: string | number;
    badgeHighlight?: boolean;
    description: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & Trends',
      icon: TrendingUp,
      badge: latestTest ? `${latestTest.total}` : undefined,
      description: 'Score progression and test trajectory',
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: Calendar,
      badge: upcomingCount > 0 ? `${upcomingCount} tasks` : 'Schedule',
      badgeHighlight: upcomingCount > 0,
      description: 'Practice test schedule & gap drills',
    },
    {
      id: 'domains',
      label: 'Domain Mastery',
      icon: Target,
      badge: '8 Domains',
      description: 'R&W and Math domain breakdown',
    },
    {
      id: 'insights',
      label: 'Score Insights',
      icon: Sparkles,
      badge: superscore ? `Super ${superscore.total}` : undefined,
      description: 'Superscore pathways & diagnostic gaps',
    },
    {
      id: 'history',
      label: 'Test History',
      icon: History,
      badge: tests.length > 0 ? `${tests.length} tests` : undefined,
      description: 'Complete log of recorded practice tests',
    },
    {
      id: 'all',
      label: 'Full View',
      icon: Layers,
      description: 'Continuous view of all sections',
    },
  ];

  return (
    <nav
      aria-label="Workspace Sections"
      className="sticky top-3 z-30 mb-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-[#e5e9f0] dark:border-slate-800 rounded-2xl p-1.5 shadow-sm transition-all"
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-sm font-extrabold'
                  : 'text-[#506684] dark:text-slate-300 hover:text-[#182235] dark:hover:text-white hover:bg-[#f6f8fb] dark:hover:bg-slate-800/80 font-bold'
              }`}
              title={tab.description}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#6f7b90] dark:text-slate-400 group-hover:text-indigo-600'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
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
