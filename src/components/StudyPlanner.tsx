import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  AlertTriangle,
  Download,
  Trash2,
  Edit2,
  Flame,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { ScheduledSession, SessionType } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';
import { OFFICIAL_SAT_DATES } from '../constants/officialDates';
import {
  calculatePerformanceGaps,
  generateSuggestedSessions,
  getInitialSampleSessions,
  downloadCalendarFile,
} from '../utils/studyPlannerUtils';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { ConfirmDialog } from './ConfirmDialog';

const STUDY_SESSIONS_STORAGE_KEY = 'satTrackerStudySessionsV1';
const TIMELINE_STORAGE_KEY = 'satTrackerSelectedDate';

type FilterTab = 'all' | 'upcoming' | 'practice_test' | 'study_block' | 'completed';

export const StudyPlanner: React.FC = () => {
  const { tests, latestTest, superscore, targetScore, domainTrends } = useSAT();

  // Selected official exam date
  const [selectedDateId, setSelectedDateId] = useState<string>(() => {
    return localStorage.getItem(TIMELINE_STORAGE_KEY) || 'sat-2026-10';
  });
  const [customDate, setCustomDate] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Active target date string
  const activeDateObj = OFFICIAL_SAT_DATES.find(d => d.id === selectedDateId);
  const targetDateStr = isCustom && customDate ? customDate : (activeDateObj?.date || '2026-10-03');

  // Days remaining calculation
  const calculateDaysRemaining = (dateString: string) => {
    const target = new Date(dateString + 'T08:00:00');
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysRemaining = calculateDaysRemaining(targetDateStr);

  // Calculate dynamic performance gaps
  const gapAnalysis = useMemo(() => {
    return calculatePerformanceGaps(targetScore, latestTest, superscore, domainTrends);
  }, [targetScore, latestTest, superscore, domainTrends]);

  // Scheduled sessions state
  const [sessions, setSessions] = useState<ScheduledSession[]>(() => {
    try {
      const saved = localStorage.getItem(STUDY_SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load study sessions', e);
    }
    // Default initial sessions tailored to user's gaps
    return getInitialSampleSessions(
      calculatePerformanceGaps(targetScore, latestTest, superscore, domainTrends),
      tests.length
    );
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduledSession | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<SessionType>('study_block');
  const [modalDefaultDomainId, setModalDefaultDomainId] = useState<string | undefined>(undefined);

  // Filter tab state
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STUDY_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save study sessions', e);
    }
  }, [sessions]);

  // Persist test date
  useEffect(() => {
    localStorage.setItem(TIMELINE_STORAGE_KEY, selectedDateId);
  }, [selectedDateId]);

  // Listen for schedule drill triggers from Domain Analysis tab
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.domainId) {
        handleOpenAddModal('study_block', e.detail.domainId);
      }
    };
    window.addEventListener('open-schedule-drill', handler);
    return () => window.removeEventListener('open-schedule-drill', handler);
  }, []);

  // Check if a recommendation is already active in the schedule
  const isSuggestionScheduled = (sug: {
    type: SessionType;
    title: string;
    domainId?: string;
    suggestionKey?: string;
  }) => {
    return sessions.some(s => {
      if (s.completed) return false;
      if (s.suggestionKey && sug.suggestionKey) {
        return s.suggestionKey === sug.suggestionKey;
      }
      if (s.title.trim().toLowerCase() === sug.title.trim().toLowerCase()) {
        return true;
      }
      if (sug.domainId && s.domainId === sug.domainId && s.type === sug.type) {
        return true;
      }
      if (sug.type === 'practice_test' && s.type === 'practice_test') {
        const sugPrefix = sug.title.split('(')[0].trim().toLowerCase();
        const sPrefix = s.title.split('(')[0].trim().toLowerCase();
        if (sugPrefix && sPrefix && sugPrefix === sPrefix) return true;
      }
      return false;
    });
  };

  // Add or update session
  const handleSaveSession = (
    sessionData: Omit<ScheduledSession, 'id' | 'createdAt' | 'completed'>,
    editId?: string
  ) => {
    if (editId) {
      setSessions(prev =>
        prev.map(s => (s.id === editId ? { ...s, ...sessionData } : s))
      );
    } else {
      const newSession: ScheduledSession = {
        ...sessionData,
        id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        completed: false,
        createdAt: Date.now(),
      };
      setSessions(prev => [newSession, ...prev]);
    }
  };

  // Toggle completion
  const handleToggleComplete = (id: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Open modal with presets
  const handleOpenAddModal = (type: SessionType = 'study_block', domainId?: string) => {
    setEditingSession(null);
    setModalDefaultType(type);
    setModalDefaultDomainId(domainId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session: ScheduledSession) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  // 1-Click add suggested session with duplicate guard
  const handleAddSuggested = (suggestion: Omit<ScheduledSession, 'id' | 'createdAt' | 'completed'>) => {
    if (isSuggestionScheduled(suggestion)) {
      setToastMessage(`"${suggestion.title}" is already in your schedule.`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const newSession: ScheduledSession = {
      ...suggestion,
      id: `sess-sug-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      completed: false,
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setToastMessage(`Added "${suggestion.title}" to schedule!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset to freshly generated recommendations
  const handleResetToRecommendations = () => {
    const fresh = getInitialSampleSessions(gapAnalysis, tests.length);
    setSessions(fresh);
    setToastMessage('Schedule reset to recommended baseline.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations for weekly scheduled hours vs recommended
  const todayDate = new Date().toISOString().split('T')[0];
  const scheduledMinutes = sessions
    .filter(s => !s.completed)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const scheduledHours = Math.round((scheduledMinutes / 60) * 10) / 10;
  const completedCount = sessions.filter(s => s.completed).length;
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearCompleted = () => {
    const remaining = sessions.filter(s => !s.completed);
    setSessions(remaining);
    setShowClearConfirm(false);
    setToastMessage(`Cleared ${completedCount} finished session${completedCount !== 1 ? 's' : ''}.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter(s => {
      if (activeTab === 'upcoming') return !s.completed;
      if (activeTab === 'completed') return s.completed;
      if (activeTab === 'practice_test') return s.type === 'practice_test';
      if (activeTab === 'study_block') return s.type === 'study_block';
      return true;
    });

    return filtered.sort((a, b) => {
      // Incomplete first, then by date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const dateA = new Date(`${a.date}T${a.time || '00:00'}:00`).getTime();
      const dateB = new Date(`${b.date}T${b.time || '00:00'}:00`).getTime();
      return dateA - dateB;
    });
  }, [sessions, activeTab]);

  // Suggested sessions from gap analysis
  const smartSuggestions = useMemo(() => {
    return generateSuggestedSessions(gapAnalysis, tests.length);
  }, [gapAnalysis, tests.length]);

  return (
    <section id="study-planner" className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 lg:p-6 shadow-card transition-all mb-3.5 sm:mb-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#182235] dark:bg-slate-800 text-white text-xs font-semibold flex items-center justify-between shadow-lg border border-white/10 dark:border-slate-700 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Target SAT Countdown */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-5 border-b border-[#f0f2f5] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="text-sm sm:text-lg font-extrabold text-[#182235] dark:text-slate-100 flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#2c4160] dark:text-indigo-400" />
              Study Planner & Scheduler
            </h2>
            <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Gap-Adaptive
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {daysRemaining > 0 ? `${daysRemaining} Days to Exam` : 'Exam Week!'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5 sm:mt-1">
            Schedule practice tests and focused study blocks calibrated to your current domain weaknesses.
          </p>
        </div>

        {/* Controls: SAT Date Selector & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#f6f8fb] dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1 text-xs">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
              Exam:
            </span>
            <select
              value={isCustom ? 'custom' : selectedDateId}
              onChange={e => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedDateId(e.target.value);
                }
              }}
              className="text-[11px] sm:text-xs font-bold text-[#2c4160] dark:text-slate-200 bg-transparent outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              {OFFICIAL_SAT_DATES.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                </option>
              ))}
              <option value="custom">Custom Date...</option>
            </select>
            {isCustom && (
              <input
                type="date"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
                className="text-xs font-bold bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-700 rounded-lg px-1.5 py-0.5 outline-none text-[#182235] dark:text-slate-200"
              />
            )}
          </div>

          <button
            onClick={() => downloadCalendarFile(sessions)}
            disabled={sessions.length === 0}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-[#405978] dark:text-slate-300 bg-[#f6f8fb] dark:bg-slate-800 hover:bg-[#eef2f7] dark:hover:bg-slate-700 border border-[#e5e9f0] dark:border-slate-700 rounded-lg sm:rounded-xl transition-all disabled:opacity-50"
            title="Export schedule to .ics calendar format (Google, Apple, Outlook)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .ics</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('study_block')}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg sm:rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Performance Gap & Study Allocation Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-4 my-3.5 sm:my-5">
        {/* Card 1: Target Deficit & Recommended Weekly Hours */}
        <div className="bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                Weekly Recommendation
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Flame className="w-3 h-3 text-amber-500" />
                {gapAnalysis.scoreGap > 0 ? `${gapAnalysis.scoreGap} pt gap` : 'Goal Hit!'}
              </span>
            </div>
            <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#182235] dark:text-white">
                {gapAnalysis.recommendedWeeklyHours} hrs
              </span>
              <span className="text-xs font-bold text-[#6f7b90] dark:text-slate-400">
                / week
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
              Based on your current {gapAnalysis.currentScore} composite vs {gapAnalysis.targetScore} target.
            </p>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-[#eef2f7] dark:border-slate-700/80">
            <div className="flex items-center justify-between text-xs font-bold mb-1 sm:mb-1.5">
              <span className="text-[#6f7b90] dark:text-slate-400">Currently Scheduled</span>
              <span className="text-[#182235] dark:text-slate-200">{scheduledHours} hrs</span>
            </div>
            <div className="w-full h-2 bg-[#e2e8f0] dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((scheduledHours / gapAnalysis.recommendedWeeklyHours) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Recommended Time Split (Math vs R&W) */}
        <div className="bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                Subject Balance
              </span>
              <span className="text-[10px] font-bold text-[#405978] dark:text-indigo-400">
                Based on deficits
              </span>
            </div>

            <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#182235] dark:text-slate-200">
                  Math: {gapAnalysis.recommendedMathPercent}%
                </span>
                <span className="text-[#6f7b90] dark:text-slate-400">
                  R&W: {gapAnalysis.recommendedRWPercent}%
                </span>
              </div>

              {/* Visual Split Bar */}
              <div className="w-full h-2.5 sm:h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 transition-all"
                  style={{ width: `${gapAnalysis.recommendedMathPercent}%` }}
                  title={`Math: ${gapAnalysis.recommendedMathPercent}%`}
                />
                <div
                  className="bg-sky-500 dark:bg-sky-400 transition-all"
                  style={{ width: `${gapAnalysis.recommendedRWPercent}%` }}
                  title={`Reading & Writing: ${gapAnalysis.recommendedRWPercent}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#6f7b90] dark:text-slate-400 pt-0.5 sm:pt-1">
                <span>Math Gap: +{gapAnalysis.mathGap} pts</span>
                <span>R&W Gap: +{gapAnalysis.rwGap} pts</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-[#eef2f7] dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-[#6f7b90] dark:text-slate-400">Active Test Pacing:</span>
            <span className="font-extrabold text-[#182235] dark:text-slate-200">
              1 Full Test every {daysRemaining > 30 ? '1-2 weeks' : '5-7 days'}
            </span>
          </div>
        </div>

        {/* Card 3: Priority Domain Gaps (1-Click Drill Scheduling) */}
        <div className="bg-[#f8fafc] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
                High-Leverage Growth Gaps
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Click to schedule drill
              </span>
            </div>

            <div className="mt-2.5 space-y-2">
              {gapAnalysis.weakestDomains.slice(0, 2).map(d => {
                const isDomainScheduled = sessions.some(s => !s.completed && s.domainId === d.domainId);
                return (
                  <div
                    key={d.domainId}
                    onClick={() => handleOpenAddModal('study_block', d.domainId)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-all group"
                    title={isDomainScheduled ? "Drill already scheduled. Click to customize or add another." : "Click to schedule a focused drill for this domain"}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#182235] dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {d.domainName}
                        </span>
                        {isDomainScheduled && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            Scheduled
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#6f7b90] dark:text-slate-400">
                        Score: {d.latestScore ?? '—'} · {d.section.toUpperCase()}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        d.gapPriority === 'critical'
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {d.gapPriority === 'critical' ? 'Priority #1' : 'Priority #2'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-[#6f7b90] dark:text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Targeting weak domains yields 2-3x faster point gains.</span>
          </div>
        </div>
      </div>

      {/* Suggested Sessions Section (Toggleable) */}
      <div className="mb-5 bg-[#f6f8fb] dark:bg-slate-800/40 border border-[#e5e9f0] dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#182235] dark:text-slate-200">
              Suggested Study Sessions Based on Performance Gaps
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToRecommendations}
              className="text-[11px] font-bold text-[#405978] dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset recommendations
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-[11px] font-bold text-[#6f7b90] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white"
            >
              {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
            </button>
          </div>
        </div>

        {showSuggestions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {smartSuggestions.map((sug, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        sug.type === 'practice_test'
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {sug.type === 'practice_test' ? 'Full Test' : 'Study Block'}
                    </span>
                    <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400">
                      {sug.durationMinutes} min
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#182235] dark:text-slate-100 leading-snug">
                    {sug.title}
                  </h4>
                  <p className="text-[11px] text-[#6f7b90] dark:text-slate-400 mt-1 line-clamp-2">
                    {sug.notes}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#f0f2f5] dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#6f7b90] dark:text-slate-400">
                    {new Date(sug.date + 'T00:00:00').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {(() => {
                    const scheduled = isSuggestionScheduled(sug);
                    if (scheduled) {
                      return (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg"
                            title="This recommendation is active in your schedule"
                          >
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>In Schedule</span>
                          </span>
                          <button
                            onClick={() => handleOpenAddModal(sug.type, sug.domainId)}
                            className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
                            title="Schedule another session on a different custom date"
                          >
                            + Another
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={() => handleAddSuggested(sug)}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2c4160] dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 bg-[#f0f4f9] dark:bg-slate-800 hover:bg-[#e2eaf4] dark:hover:bg-slate-700/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Tabs & Interactive Session List */}
      <div>
        {/* Filter Navigation */}
        <div className="flex items-center justify-between gap-2.5 border-b border-[#f0f2f5] dark:border-slate-800 pb-2.5 sm:pb-3 mb-3 sm:mb-4 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 bg-[#f6f8fb] dark:bg-slate-800/70 border border-[#e5e9f0] dark:border-slate-700 rounded-lg sm:rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
              }`}
            >
              All ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
              }`}
            >
              Upcoming ({sessions.filter(s => !s.completed).length})
            </button>
            <button
              onClick={() => setActiveTab('practice_test')}
              className={`text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'practice_test'
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
              }`}
            >
              Tests ({sessions.filter(s => s.type === 'practice_test').length})
            </button>
            <button
              onClick={() => setActiveTab('study_block')}
              className={`text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'study_block'
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
              }`}
            >
              Study Blocks ({sessions.filter(s => s.type === 'study_block').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`text-[11px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-xs'
                  : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="text-[11px] sm:text-xs text-[#6f7b90] dark:text-slate-400 font-semibold">
              {completedCount}/{sessions.length} finished ({sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0}%)
            </div>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                title="Remove finished sessions to keep schedule clean"
              >
                <Trash2 className="w-3 h-3" />
                Clear ({completedCount})
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="p-10 border border-dashed border-[#e5e9f0] dark:border-slate-800 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f6f8fb] dark:bg-slate-800 flex items-center justify-center mx-auto text-[#6f7b90] dark:text-slate-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-[#182235] dark:text-slate-200">
              No sessions found in this view
            </h4>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Plan your upcoming practice test sessions and domain study blocks to reach your target score.
            </p>
            <button
              onClick={() => handleOpenAddModal('study_block')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-[#2c4160] dark:bg-indigo-600 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule First Session
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map(session => {
              const isToday = session.date === todayDate;
              const isPast = session.date < todayDate;
              const isOverdue = isPast && !session.completed;
              const domainObj = session.domainId ? DOMAIN_META.find(d => d.id === session.domainId) : null;

              return (
                <div
                  key={session.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    session.completed
                      ? 'bg-[#f8fafc]/60 dark:bg-slate-800/30 border-[#eef2f7] dark:border-slate-800/80 opacity-70'
                      : isToday
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                      : isOverdue
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-[#e5e9f0] dark:border-slate-800 hover:border-[#c8d0db] dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left: Checkbox + Title & Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(session.id)}
                      className="mt-0.5 text-[#2c4160] dark:text-indigo-400 hover:scale-110 transition-transform shrink-0"
                      title={session.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {session.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#94a3b8] dark:text-slate-500 hover:text-[#2c4160]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            session.type === 'practice_test'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {session.type === 'practice_test' ? 'Practice Test' : 'Study Block'}
                        </span>

                        {domainObj && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eef2f7] dark:bg-slate-800 text-[#405978] dark:text-slate-300">
                            {domainObj.name}
                          </span>
                        )}

                        {session.priority === 'high' && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 uppercase tracking-wider">
                            High Priority
                          </span>
                        )}

                        {isToday && !session.completed && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            TODAY
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase tracking-wider">
                            OVERDUE
                          </span>
                        )}
                      </div>

                      <div
                        className={`text-sm font-extrabold text-[#182235] dark:text-slate-100 mt-1 ${
                          session.completed ? 'line-through text-[#6f7b90] dark:text-slate-500' : ''
                        }`}
                      >
                        {session.title}
                      </div>

                      {session.notes && (
                        <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5 line-clamp-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Duration, Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f0f2f5] dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-[#182235] dark:text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#6f7b90] dark:text-slate-400" />
                        <span>
                          {new Date(session.date + 'T00:00:00').toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {session.time ? ` · ${session.time}` : ''}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#6f7b90] dark:text-slate-400 mt-0.5">
                        {session.durationMinutes} minutes
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(session)}
                        className="p-1.5 rounded-lg text-[#6f7b90] hover:text-[#182235] dark:text-slate-400 dark:hover:text-white hover:bg-[#f6f8fb] dark:hover:bg-slate-800 transition-colors"
                        title="Edit session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-lg text-[#6f7b90] hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSession}
        editSession={editingSession}
        defaultType={modalDefaultType}
        defaultDomainId={modalDefaultDomainId}
      />

      {/* Clear Completed Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Finished Sessions?"
        message={`Are you sure you want to remove all ${completedCount} finished study session${completedCount !== 1 ? 's' : ''} from your schedule? This will tidy up your upcoming view.`}
        confirmLabel="Clear Finished"
        variant="danger"
        onConfirm={handleClearCompleted}
        onCancel={() => setShowClearConfirm(false)}
      />
    </section>
  );
};
