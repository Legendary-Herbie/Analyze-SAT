import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, Square, Target } from 'lucide-react';
import { OFFICIAL_SAT_DATES } from '../constants/officialDates';
import { StudyMilestone } from '../types/sat';
import { useSAT } from '../context/SATContext';

const TIMELINE_STORAGE_KEY = 'satTrackerSelectedDate';
const MILESTONES_STORAGE_KEY = 'satTrackerMilestones';

export const TestTimelineCard: React.FC = () => {
  const { tests } = useSAT();
  const [selectedDateId, setSelectedDateId] = useState<string>(() => {
    return localStorage.getItem(TIMELINE_STORAGE_KEY) || 'sat-2026-10';
  });

  const [customDate, setCustomDate] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Target date string
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

  // Default milestones based on tests count and target date
  const generateDefaultMilestones = (targetDate: string): StudyMilestone[] => {
    const target = new Date(targetDate + 'T00:00:00');
    const today = new Date();

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const d1 = new Date(today);
    d1.setDate(today.getDate() + 4);

    const d2 = new Date(today);
    d2.setDate(today.getDate() + 11);

    const d3 = new Date(target);
    d3.setDate(target.getDate() - 7);

    const d4 = new Date(target);
    d4.setDate(target.getDate() - 2);

    const nextTestNum = tests.length + 1;

    return [
      {
        id: 'm-1',
        title: `Take Practice Test #${nextTestNum} under strict time conditions`,
        targetDate: formatDate(d1),
        completed: false,
        type: 'test',
      },
      {
        id: 'm-2',
        title: 'Deep-dive review on weak domains & Desmos graphing tricks',
        targetDate: formatDate(d2),
        completed: false,
        type: 'review',
      },
      {
        id: 'm-3',
        title: `Final Dress Rehearsal (Practice Test #${nextTestNum + 1})`,
        targetDate: formatDate(d3),
        completed: false,
        type: 'test',
      },
      {
        id: 'm-4',
        title: 'Formulas, Punctuation Rules, & Test Bag Prep (Pencils & Admission Ticket)',
        targetDate: formatDate(d4),
        completed: false,
        type: 'rest',
      },
    ];
  };

  const [milestones, setMilestones] = useState<StudyMilestone[]>(() => {
    try {
      const saved = localStorage.getItem(MILESTONES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return generateDefaultMilestones(targetDateStr);
  });

  useEffect(() => {
    localStorage.setItem(TIMELINE_STORAGE_KEY, selectedDateId);
  }, [selectedDateId]);

  useEffect(() => {
    localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(milestones));
  }, [milestones]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const completedCount = milestones.filter(m => m.completed).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl p-5 shadow-card mb-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#f0f2f5] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#182235] dark:text-slate-100">
              Practice Timeline & SAT Countdown
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Exam Week!'}
            </span>
          </div>
          <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-0.5">
            Pacing milestones to ensure you peak right on official test day.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 flex-wrap">
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
            className="text-xs font-bold text-[#2c4160] dark:text-slate-200 bg-[#f6f8fb] dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none"
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
              className="text-xs font-bold bg-[#f6f8fb] dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl px-2 py-1 outline-none text-[#182235] dark:text-slate-200"
            />
          )}
        </div>
      </div>

      {/* Countdown Hero Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <div className="bg-[#f6f8fb] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#2c4160] dark:text-indigo-400 shadow-sm shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#6f7b90] dark:text-slate-400">
              Official SAT Countdown
            </div>
            <div className="text-xl font-black text-[#182235] dark:text-white">
              {daysRemaining > 0 ? `${daysRemaining} Days` : 'Today!'}
            </div>
          </div>
        </div>

        <div className="bg-[#f6f8fb] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#2c4160] dark:text-indigo-400 shadow-sm shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#6f7b90] dark:text-slate-400">
              Exam Date
            </div>
            <div className="text-sm font-black text-[#182235] dark:text-white truncate">
              {new Date(targetDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#f6f8fb] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-[#6f7b90] dark:text-slate-400">
              Pacing Progress
            </div>
            <div className="text-sm font-black text-[#182235] dark:text-white">
              {completedCount} of {milestones.length} Milestones ({Math.round((completedCount / milestones.length) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Milestones Checklist */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1">
          <span>Target Pacing Milestones</span>
          <button
            onClick={() => setMilestones(generateDefaultMilestones(targetDateStr))}
            className="text-[10px] font-bold text-[#2c4160] dark:text-indigo-400 hover:underline normal-case tracking-normal"
          >
            Reset to recommended schedule
          </button>
        </div>

        <div className="space-y-2">
          {milestones.map(m => {
            const milestoneDays = calculateDaysRemaining(m.targetDate);
            const isDueSoon = milestoneDays <= 3 && milestoneDays >= 0 && !m.completed;

            return (
              <div
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  m.completed
                    ? 'bg-[#f6f8fb]/50 dark:bg-slate-800/20 border-transparent opacity-60 line-through'
                    : isDueSoon
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/70'
                    : 'bg-white dark:bg-slate-800 border-[#e5e9f0] dark:border-slate-700 hover:border-[#c8d0db] dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button type="button" className="text-[#2c4160] dark:text-indigo-400 shrink-0">
                    {m.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-[#6f7b90] dark:text-slate-400" />
                    )}
                  </button>
                  <span className="text-xs font-bold text-[#182235] dark:text-slate-200 truncate">
                    {m.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      m.completed
                        ? 'text-[#6f7b90] dark:text-slate-500'
                        : isDueSoon
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-bold'
                        : 'bg-[#eef2f7] dark:bg-slate-700 text-[#405978] dark:text-slate-300'
                    }`}
                  >
                    {new Date(m.targetDate + 'T00:00:00').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
