import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp, Zap, Compass } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { DOMAIN_META, TEST_SOURCES } from '../constants/domains';
import { SATTest } from '../types/sat';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTest?: SATTest | null;
}

type FormValues = {
  name: string;
  date: string;
  source: string;
  total: string;
  rw: string;
  math: string;
  notes: string;
  rwModule2Difficulty: 'hard' | 'easy' | '';
  mathModule2Difficulty: 'hard' | 'easy' | '';
  domains: Record<string, { correct: string; total: string; pct: string; score: string }>;
};

const emptyDomains = () =>
  Object.fromEntries(DOMAIN_META.map(d => [d.id, { correct: '', total: '', pct: '', score: '' }]));

const numOrNull = (s: string): number | null => {
  const n = Number(s);
  return s.trim() === '' || isNaN(n) ? null : n;
};

const QUICK_PRESETS = [
  'Bluebook Test 1',
  'Bluebook Test 2',
  'Bluebook Test 3',
  'Bluebook Test 4',
  'Bluebook Test 5',
  'Bluebook Test 6',
  'Bluebook Test 7',
];

export const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose, editTest }) => {
  const { addTest, updateTest, orderedTests } = useSAT();
  const [showDomains, setShowDomains] = useState(false);
  const [showModuleRouting, setShowModuleRouting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rwInputRef = useRef<HTMLInputElement>(null);
  const mathInputRef = useRef<HTMLInputElement>(null);
  const totalInputRef = useRef<HTMLInputElement>(null);

  const getInitialValues = (): FormValues => {
    if (editTest) {
      return {
        name: editTest.name || '',
        date: editTest.date || '',
        source: editTest.source || '',
        total: String(editTest.total || ''),
        rw: String(editTest.rw || ''),
        math: String(editTest.math || ''),
        notes: editTest.notes || '',
        rwModule2Difficulty: editTest.moduleRouting?.rwModule2Difficulty || '',
        mathModule2Difficulty: editTest.moduleRouting?.mathModule2Difficulty || '',
        domains: Object.fromEntries(
          DOMAIN_META.map(d => [
            d.id,
            {
              correct: String(editTest.domains?.[d.id]?.correct ?? ''),
              total: String(editTest.domains?.[d.id]?.total ?? ''),
              pct: String(editTest.domains?.[d.id]?.pct ?? ''),
              score: String(editTest.domains?.[d.id]?.score ?? ''),
            },
          ])
        ),
      };
    }
    return {
      name: '',
      date: new Date().toISOString().split('T')[0],
      source: 'Bluebook Practice Test',
      total: '',
      rw: '',
      math: '',
      notes: '',
      rwModule2Difficulty: 'hard',
      mathModule2Difficulty: 'hard',
      domains: emptyDomains(),
    };
  };

  const [form, setForm] = useState<FormValues>(getInitialValues);

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialValues());
      setErrors({});
      setShowDomains(false);
      setShowModuleRouting(false);
      // Auto-focus first score field for fast entry
      setTimeout(() => {
        rwInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editTest]);

  // Real-time calculation: when RW and Math are both valid, auto-sum Total
  useEffect(() => {
    const rw = numOrNull(form.rw);
    const math = numOrNull(form.math);
    if (rw != null && math != null) {
      setForm(prev => ({ ...prev, total: String(rw + math) }));
    }
  }, [form.rw, form.math]);

  const setField = (field: keyof Omit<FormValues, 'domains'>, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const e = { ...prev };
      delete e[field];
      return e;
    });
  };

  const setDomainField = (domainId: string, field: 'correct' | 'total' | 'pct' | 'score', value: string) => {
    setForm(prev => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domainId]: { ...prev.domains[domainId], [field]: value },
      },
    }));
  };

  const handlePresetSelect = (preset: string) => {
    setField('name', preset);
    setField('source', 'Bluebook Practice Test');
    rwInputRef.current?.focus();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const rw = numOrNull(form.rw);
    const math = numOrNull(form.math);
    const total = numOrNull(form.total);

    if (rw === null) newErrors.rw = 'Required (200–800)';
    else if (rw < 200 || rw > 800) newErrors.rw = 'Must be 200–800';

    if (math === null) newErrors.math = 'Required (200–800)';
    else if (math < 200 || math > 800) newErrors.math = 'Must be 200–800';

    if (total === null) newErrors.total = 'Required (400–1600)';
    else if (total < 400 || total > 1600) newErrors.total = 'Must be 400–1600';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const domains: SATTest['domains'] = {};
    for (const d of DOMAIN_META) {
      const df = form.domains[d.id];
      const correct = numOrNull(df.correct);
      const total = numOrNull(df.total);
      let pct = numOrNull(df.pct);
      const score = numOrNull(df.score);
      // Auto-calc pct if missing
      if (pct === null && correct !== null && total !== null && total > 0) {
        pct = Math.round((correct / total) * 100);
      }
      if ([correct, total, pct, score].some(v => v !== null)) {
        domains[d.id] = { correct, total, pct, score };
      }
    }

    const testName = form.name.trim() || `Practice Test ${orderedTests.length + 1}`;

    const testData: Omit<SATTest, 'id'> = {
      name: testName,
      date: form.date,
      source: form.source,
      total: Number(form.total),
      rw: Number(form.rw),
      math: Number(form.math),
      notes: form.notes.trim(),
      domains,
      moduleRouting: {
        rwModule2Difficulty: form.rwModule2Difficulty ? (form.rwModule2Difficulty as 'hard' | 'easy') : null,
        mathModule2Difficulty: form.mathModule2Difficulty ? (form.mathModule2Difficulty as 'hard' | 'easy') : null,
      },
    };

    if (editTest) {
      updateTest(editTest.id, testData);
    } else {
      addTest(testData);
    }

    onClose();
  };

  if (!isOpen) return null;

  const rwSection = DOMAIN_META.filter(d => d.section === 'rw');
  const mathSection = DOMAIN_META.filter(d => d.section === 'math');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] dark:border-slate-800 shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 mb-1.5">
                <Zap className="w-3 h-3" />
                Fast Numerical Entry
              </div>
              <h2 className="text-xl font-black text-[#182235] dark:text-slate-100">
                {editTest ? 'Edit Practice Test' : 'Add Practice Test'}
              </h2>
              <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">
                Enter section scores (Total auto-calculates). Tab to navigate quickly.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="px-6 pt-3 pb-2 bg-[#fafbfc] dark:bg-slate-900/60 border-b border-[#e5e9f0] dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 shrink-0">
              Quick Presets:
            </span>
            {QUICK_PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 hover:border-[#2c4160] dark:hover:border-indigo-400 text-[#2c4160] dark:text-slate-200 transition-colors shrink-0"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Core Scores (Highlighted for quick entry) */}
            <div className="bg-[#f6f8fb] dark:bg-slate-800/40 border border-[#e5e9f0] dark:border-slate-700 p-4 rounded-xl">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#182235] dark:text-slate-200 mb-3 flex items-center justify-between">
                <span>Core Scaled Scores (Required)</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold lowercase">
                  ✓ total auto-calculates from r&w + math
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Reading & Writing (200–800)" error={errors.rw}>
                  <input
                    ref={rwInputRef}
                    type="number"
                    min={200}
                    max={800}
                    step={10}
                    placeholder="e.g. 690"
                    value={form.rw}
                    onChange={e => setField('rw', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        mathInputRef.current?.focus();
                      }
                    }}
                    className={`form-input font-bold text-base ${errors.rw ? 'border-red-400 dark:border-red-500' : ''}`}
                  />
                </Field>

                <Field label="Math (200–800)" error={errors.math}>
                  <input
                    ref={mathInputRef}
                    type="number"
                    min={200}
                    max={800}
                    step={10}
                    placeholder="e.g. 740"
                    value={form.math}
                    onChange={e => setField('math', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        totalInputRef.current?.focus();
                      }
                    }}
                    className={`form-input font-bold text-base ${errors.math ? 'border-red-400 dark:border-red-500' : ''}`}
                  />
                </Field>

                <Field label="Total Composite Score" error={errors.total}>
                  <input
                    ref={totalInputRef}
                    type="number"
                    min={400}
                    max={1600}
                    step={10}
                    placeholder="e.g. 1430"
                    value={form.total}
                    onChange={e => setField('total', e.target.value)}
                    className={`form-input font-black text-base text-[#2c4160] dark:text-indigo-400 ${
                      errors.total ? 'border-red-400 dark:border-red-500' : ''
                    }`}
                  />
                </Field>
              </div>
            </div>

            {/* Test Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Test Name" optional>
                <input
                  type="text"
                  placeholder={`Practice Test ${orderedTests.length + 1}`}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className="form-input"
                />
              </Field>
              <Field label="Date" optional>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setField('date', e.target.value)}
                  className="form-input"
                />
              </Field>
              <Field label="Test Source" optional>
                <select
                  value={form.source}
                  onChange={e => setField('source', e.target.value)}
                  className="form-input"
                >
                  <option value="">Not specified</option>
                  {TEST_SOURCES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Digital SAT Module 2 Adaptive Routing Check */}
            <div className="border border-[#e5e9f0] dark:border-slate-700/80 rounded-xl p-3 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
                  <span className="text-xs font-bold text-[#182235] dark:text-slate-200">
                    Digital SAT Module 2 Routing (Optional)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModuleRouting(r => !r)}
                  className="text-xs font-bold text-[#405978] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white flex items-center gap-1"
                >
                  {showModuleRouting ? 'Hide' : 'Configure'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showModuleRouting ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showModuleRouting && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#f0f2f5] dark:border-slate-700">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-[#6f7b90] dark:text-slate-400 block mb-1">
                      Reading & Writing Module 2
                    </label>
                    <select
                      value={form.rwModule2Difficulty}
                      onChange={e => setField('rwModule2Difficulty', e.target.value)}
                      className="form-input text-xs"
                    >
                      <option value="hard">Harder Module 2 Unlocked (Ceiling 800)</option>
                      <option value="easy">Easier Module 2 (Score Capped ~590)</option>
                      <option value="">Unknown / Not Tracked</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-[#6f7b90] dark:text-slate-400 block mb-1">
                      Math Module 2
                    </label>
                    <select
                      value={form.mathModule2Difficulty}
                      onChange={e => setField('mathModule2Difficulty', e.target.value)}
                      className="form-input text-xs"
                    >
                      <option value="hard">Harder Module 2 Unlocked (Ceiling 800)</option>
                      <option value="easy">Easier Module 2 (Score Capped ~570)</option>
                      <option value="">Unknown / Not Tracked</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Field label="Notes / Pacing Reflections" optional>
                <textarea
                  placeholder="E.g., Ran out of time on Reading Q22-27, solved 5 questions with Desmos regression..."
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={2}
                  className="form-input resize-none"
                />
              </Field>
            </div>

            {/* Domain Details Accordion */}
            <div className="pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#e5e9f0] dark:border-slate-700 bg-[#f6f8fb] dark:bg-slate-800/40">
                <div>
                  <h3 className="text-xs font-extrabold text-[#182235] dark:text-slate-200">
                    Domain & Subscore Details{' '}
                    <span className="font-normal text-[#6f7b90] dark:text-slate-400">(optional)</span>
                  </h3>
                  <p className="text-[10px] text-[#6f7b90] dark:text-slate-400 mt-0.5">
                    Unlocks granular strength and weakness tracking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDomains(p => !p)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#405978] dark:text-slate-300 bg-white dark:bg-slate-700 border border-[#e5e9f0] dark:border-slate-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {showDomains ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showDomains ? 'Hide' : 'Show'} Domain Fields
                </button>
              </div>

              {showDomains && (
                <div className="space-y-4 mt-3">
                  {[
                    { label: 'Reading & Writing Domains', domains: rwSection },
                    { label: 'Math Domains', domains: mathSection },
                  ].map(({ label, domains }) => (
                    <div key={label}>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400 mb-1.5">
                        {label}
                      </div>
                      <div className="border border-[#e5e9f0] dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                        <div
                          className="grid px-3 py-2 bg-[#f6f8fb] dark:bg-slate-900/60 border-b border-[#e5e9f0] dark:border-slate-700 text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400"
                          style={{ gridTemplateColumns: '1.8fr repeat(4, 0.7fr)' }}
                        >
                          <span>Domain</span>
                          <span>Correct</span>
                          <span>Total</span>
                          <span>Accuracy %</span>
                          <span>Domain Score</span>
                        </div>
                        {domains.map(d => (
                          <div
                            key={d.id}
                            className="grid items-center px-3 py-2 border-b border-[#f0f2f5] dark:border-slate-700/60 last:border-b-0 gap-2"
                            style={{ gridTemplateColumns: '1.8fr repeat(4, 0.7fr)' }}
                          >
                            <span className="text-xs font-bold text-[#182235] dark:text-slate-200 truncate">
                              {d.name}
                            </span>
                            <input
                              type="number"
                              min={0}
                              placeholder="—"
                              value={form.domains[d.id].correct}
                              onChange={e => setDomainField(d.id, 'correct', e.target.value)}
                              className="form-input-sm"
                            />
                            <input
                              type="number"
                              min={1}
                              placeholder="—"
                              value={form.domains[d.id].total}
                              onChange={e => setDomainField(d.id, 'total', e.target.value)}
                              className="form-input-sm"
                            />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              placeholder="—"
                              value={form.domains[d.id].pct}
                              onChange={e => setDomainField(d.id, 'pct', e.target.value)}
                              className="form-input-sm"
                            />
                            <input
                              type="number"
                              min={200}
                              max={800}
                              placeholder="—"
                              value={form.domains[d.id].score}
                              onChange={e => setDomainField(d.id, 'score', e.target.value)}
                              className="form-input-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/90 shrink-0">
            <span className="text-[11px] text-[#6f7b90] dark:text-slate-400">
              Press Enter on score fields to advance quickly.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-[#405978] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all active:scale-95 shadow-md"
              >
                {editTest ? 'Save Changes' : 'Save Test Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-extrabold text-[#6f7b90] dark:text-slate-400 uppercase tracking-wider">
        {label}
        {optional && (
          <span className="font-normal normal-case tracking-normal ml-1 opacity-70">(optional)</span>
        )}
      </label>
      {children}
      {error && <span className="text-xs text-red-500 font-semibold">{error}</span>}
    </div>
  );
}
