import React, { useState, useEffect } from 'react';
import { X, BookOpen, Target } from 'lucide-react';
import { ScheduledSession, SessionType, PriorityLevel, SATSection } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: Omit<ScheduledSession, 'id' | 'createdAt' | 'completed'>, editId?: string) => void;
  editSession?: ScheduledSession | null;
  defaultType?: SessionType;
  defaultDomainId?: string;
}

const TEST_PRESETS = [
  'Bluebook Practice Test #1',
  'Bluebook Practice Test #2',
  'Bluebook Practice Test #3',
  'Bluebook Practice Test #4',
  'Bluebook Practice Test #5',
  'Bluebook Practice Test #6',
];

const STUDY_PRESETS = [
  'Geometry: Circles, Triangles & Desmos',
  'Advanced Math: Quadratics & Polynomials',
  'Algebra: Systems of Equations & Sliders',
  'Craft & Structure: Words in Context Drill',
  'Standard English: Punctuation & Modifiers',
  'Information & Ideas: Evidence & Infographics',
  'Timed 27-Question Module 2 Speed Rehearsal',
  'Post-Test Error Log & Question Deconstruction',
];

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editSession,
  defaultType = 'study_block',
  defaultDomainId,
}) => {
  const [type, setType] = useState<SessionType>(defaultType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [section, setSection] = useState<SATSection | 'both'>('both');
  const [domainId, setDomainId] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSession) {
      setType(editSession.type);
      setTitle(editSession.title);
      setDate(editSession.date);
      setTime(editSession.time || '16:00');
      setDurationMinutes(editSession.durationMinutes);
      setSection(editSession.section || 'both');
      setDomainId(editSession.domainId || '');
      setPriority(editSession.priority || 'medium');
      setNotes(editSession.notes || '');
    } else {
      setType(defaultType);
      setTitle(defaultType === 'practice_test' ? 'Bluebook Practice Test' : 'Focused Domain Drill');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTime(defaultType === 'practice_test' ? '09:00' : '16:30');
      setDurationMinutes(defaultType === 'practice_test' ? 134 : 45);
      setPriority('medium');
      setNotes('');

      if (defaultDomainId) {
        const found = DOMAIN_META.find(d => d.id === defaultDomainId);
        if (found) {
          setDomainId(found.id);
          setSection(found.section);
          setTitle(`${found.name} Targeted Drill`);
        }
      } else {
        setDomainId('');
        setSection(defaultType === 'practice_test' ? 'both' : 'math');
      }
    }
    setError('');
  }, [isOpen, editSession, defaultType, defaultDomainId]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: SessionType) => {
    setType(newType);
    if (newType === 'practice_test') {
      setDurationMinutes(134);
      setSection('both');
      setDomainId('');
      if (!editSession) {
        setTitle('Bluebook Practice Test');
        setTime('09:00');
      }
    } else {
      setDurationMinutes(45);
      if (!editSession) {
        setTitle('Focused Domain Drill');
        setTime('16:30');
      }
    }
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDomainId(val);
    if (val) {
      const found = DOMAIN_META.find(d => d.id === val);
      if (found) {
        setSection(found.section);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this session.');
      return;
    }
    if (!date) {
      setError('Please select a scheduled date.');
      return;
    }

    onSave(
      {
        type,
        title: title.trim(),
        date,
        time,
        durationMinutes: Number(durationMinutes) || 45,
        section,
        domainId: domainId || undefined,
        priority,
        notes: notes.trim() || undefined,
      },
      editSession ? editSession.id : undefined
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              type === 'practice_test'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
            }`}>
              {type === 'practice_test' ? <Target className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#182235] dark:text-white">
                {editSession ? 'Edit Scheduled Session' : 'Schedule SAT Session'}
              </h2>
              <p className="text-xs text-[#6f7b90] dark:text-slate-400">
                Plan targeted practice to bridge current performance gaps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6f7b90] hover:text-[#182235] dark:text-slate-400 dark:hover:text-white hover:bg-[#f6f8fb] dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Session Type Segmented Selector */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
              Session Category
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f6f8fb] dark:bg-slate-800/80 rounded-xl border border-[#e5e9f0] dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleTypeChange('practice_test')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all ${
                  type === 'practice_test'
                    ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-sm'
                    : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
                }`}
              >
                <Target className="w-4 h-4" />
                Practice Test (Timed)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('study_block')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all ${
                  type === 'study_block'
                    ? 'bg-[#2c4160] text-white dark:bg-indigo-600 shadow-sm'
                    : 'text-[#6f7b90] dark:text-slate-300 hover:text-[#182235]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Study Block (Focused)
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(type === 'practice_test' ? TEST_PRESETS : STUDY_PRESETS).slice(0, 4).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTitle(p)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#f6f8fb] dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 text-[#405978] dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
              Session Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'practice_test' ? 'e.g., Bluebook Test 5 Simulation' : 'e.g., Geometry & Circles Intensive'}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-[#182235] dark:text-white"
            />
          </div>

          {/* Focus Domain & Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                Target Section
              </label>
              <select
                value={section}
                onChange={e => setSection(e.target.value as SATSection | 'both')}
                className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none text-[#182235] dark:text-white"
              >
                <option value="both">Both (Composite dSAT)</option>
                <option value="rw">Reading & Writing</option>
                <option value="math">Math</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                Specific Domain
              </label>
              <select
                value={domainId}
                onChange={handleDomainChange}
                className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none text-[#182235] dark:text-white"
              >
                <option value="">All Domains in Section</option>
                {DOMAIN_META.filter(d => section === 'both' || d.section === section).map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.section.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none text-[#182235] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none text-[#182235] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none text-[#182235] dark:text-white"
              >
                <option value={15}>15 min (Speed drill)</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1 hr)</option>
                <option value={90}>90 min (1.5 hr)</option>
                <option value={134}>134 min (Full Test)</option>
              </select>
            </div>
          </div>

          {/* Duration Quick Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400">Quick Duration:</span>
            {[15, 30, 45, 60, 90, 134].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                  durationMinutes === mins
                    ? 'bg-[#2c4160] text-white dark:bg-indigo-600 border-[#2c4160] dark:border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-[#405978] dark:text-slate-300 border-[#e5e9f0] dark:border-slate-700 hover:border-[#2c4160]'
                }`}
              >
                {mins === 134 ? 'Full Test (134m)' : `${mins}m`}
              </button>
            ))}
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as PriorityLevel[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border-red-300 dark:border-red-800'
                        : p === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-[#6f7b90] dark:text-slate-400 border-[#e5e9f0] dark:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Strategy */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
              Study Focus / Strategy Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Focus on circle equations and Desmos regression tricks. Review missed questions right after."
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-[#182235] dark:text-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e9f0] dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6f7b90] dark:text-slate-300 hover:bg-[#f6f8fb] dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all shadow-md"
            >
              {editSession ? 'Update Session' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
