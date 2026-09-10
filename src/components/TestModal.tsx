import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
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
  domains: Record<string, { correct: string; total: string; pct: string; score: string }>;
};

const emptyDomains = () =>
  Object.fromEntries(DOMAIN_META.map(d => [d.id, { correct: '', total: '', pct: '', score: '' }]));

const numOrNull = (s: string): number | null => {
  const n = Number(s);
  return s.trim() === '' || isNaN(n) ? null : n;
};

export const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose, editTest }) => {
  const { addTest, updateTest, orderedTests } = useSAT();
  const [showDomains, setShowDomains] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        domains: Object.fromEntries(
          DOMAIN_META.map(d => [
            d.id,
            {
              correct: String(editTest.domains?.[d.id]?.correct ?? ''),
              total: String(editTest.domains?.[d.id]?.total ?? ''),
              pct: String(editTest.domains?.[d.id]?.pct ?? ''),
              score: String(editTest.domains?.[d.id]?.score ?? ''),
            }
          ])
        )
      };
    }
    return {
      name: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      total: '',
      rw: '',
      math: '',
      notes: '',
      domains: emptyDomains(),
    };
  };

  const [form, setForm] = useState<FormValues>(getInitialValues);

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialValues());
      setErrors({});
      setShowDomains(false);
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, editTest]);

  // Auto-calc total when rw/math change
  useEffect(() => {
    const rw = numOrNull(form.rw);
    const math = numOrNull(form.math);
    if (rw != null && math != null && form.total === '') {
      setForm(prev => ({ ...prev, total: String(rw + math) }));
    }
  }, [form.rw, form.math]);

  const setField = (field: keyof Omit<FormValues, 'domains'>, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const setDomainField = (domainId: string, field: 'correct' | 'total' | 'pct' | 'score', value: string) => {
    setForm(prev => ({
      ...prev,
      domains: {
        ...prev.domains,
        [domainId]: { ...prev.domains[domainId], [field]: value }
      }
    }));
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
    };

    if (editTest) {
      updateTest(editTest.id, testData);
    } else {
      addTest(testData);
    }

    onClose();
  };

  const rwSection = DOMAIN_META.filter(d => d.section === 'rw');
  const mathSection = DOMAIN_META.filter(d => d.section === 'math');

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-3xl rounded-2xl p-0 backdrop:bg-[#12182880]"
      style={{ boxShadow: '0 26px 90px rgba(0,0,0,0.22)' }}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#182235]">{editTest ? 'Edit Test' : 'Add Practice Test'}</h2>
            <p className="text-xs text-[#6f7b90] mt-1">Total, R&W, and Math scores are required. Everything else is optional.</p>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-[#eef2f7] hover:bg-[#e5e9f0] flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#405978]" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {/* Main fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} className="form-input" />
            </Field>
            <Field label="Source" optional>
              <select value={form.source} onChange={e => setField('source', e.target.value)} className="form-input">
                <option value="">Not specified</option>
                {TEST_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Reading & Writing" error={errors.rw}>
              <input
                type="number" min={200} max={800} step={10}
                placeholder="680"
                value={form.rw}
                onChange={e => setField('rw', e.target.value)}
                className={`form-input ${errors.rw ? 'border-red-400' : ''}`}
              />
            </Field>
            <Field label="Math" error={errors.math}>
              <input
                type="number" min={200} max={800} step={10}
                placeholder="720"
                value={form.math}
                onChange={e => setField('math', e.target.value)}
                className={`form-input ${errors.math ? 'border-red-400' : ''}`}
              />
            </Field>
            <Field label="Total Score" error={errors.total}>
              <input
                type="number" min={400} max={1600} step={10}
                placeholder="1400"
                value={form.total}
                onChange={e => setField('total', e.target.value)}
                className={`form-input ${errors.total ? 'border-red-400' : ''}`}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Notes" optional>
              <textarea
                placeholder="Areas to focus on, time issues, test conditions..."
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                rows={2}
                className="form-input resize-none"
              />
            </Field>
          </div>

          {/* Domain fields */}
          <div className="mt-5 pt-4 border-t border-[#e5e9f0]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#182235]">
                  Domain Details <span className="font-normal text-[#6f7b90]">(all optional)</span>
                </h3>
                <p className="text-xs text-[#6f7b90] mt-0.5">Enter only the data your platform provides.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDomains(p => !p)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#405978] bg-[#eef2f7] hover:bg-[#e5e9f0] px-3 py-1.5 rounded-lg transition-colors"
              >
                {showDomains ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showDomains ? 'Hide' : 'Show'} domain fields
              </button>
            </div>

            {showDomains && (
              <div className="space-y-5">
                {[
                  { label: 'Reading & Writing Domains', domains: rwSection },
                  { label: 'Math Domains', domains: mathSection },
                ].map(({ label, domains }) => (
                  <div key={label}>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6f7b90] mb-2">{label}</div>
                    <div className="space-y-0 border border-[#e5e9f0] rounded-xl overflow-hidden">
                      {/* Column headers */}
                      <div className="grid px-3 py-2 bg-[#f6f8fb] border-b border-[#e5e9f0] text-[9px] font-extrabold uppercase tracking-wider text-[#6f7b90]" style={{ gridTemplateColumns: '1.8fr repeat(4, 0.7fr)' }}>
                        <span>Domain</span>
                        <span>Correct</span>
                        <span>Total</span>
                        <span>Accuracy %</span>
                        <span>Domain Score</span>
                      </div>
                      {domains.map(d => (
                        <div key={d.id} className="grid items-center px-3 py-2.5 border-b border-[#f0f2f5] last:border-b-0 gap-2" style={{ gridTemplateColumns: '1.8fr repeat(4, 0.7fr)' }}>
                          <span className="text-xs font-bold text-[#182235]">{d.name}</span>
                          <input type="number" min={0} placeholder="—" value={form.domains[d.id].correct} onChange={e => setDomainField(d.id, 'correct', e.target.value)} className="form-input-sm" />
                          <input type="number" min={1} placeholder="—" value={form.domains[d.id].total} onChange={e => setDomainField(d.id, 'total', e.target.value)} className="form-input-sm" />
                          <input type="number" min={0} max={100} placeholder="—" value={form.domains[d.id].pct} onChange={e => setDomainField(d.id, 'pct', e.target.value)} className="form-input-sm" />
                          <input type="number" min={200} max={800} placeholder="—" value={form.domains[d.id].score} onChange={e => setDomainField(d.id, 'score', e.target.value)} className="form-input-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-[#6f7b90]">
                  Accuracy % is auto-calculated from Correct / Total if left blank.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e9f0] bg-[#fafbfc] shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#405978] bg-white border border-[#e5e9f0] hover:bg-[#f6f8fb] rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 text-sm font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] rounded-xl transition-all active:scale-95 shadow-md">
            {editTest ? 'Save Changes' : 'Save Test'}
          </button>
        </div>
      </form>
    </dialog>
  );
};

function Field({
  label, optional, error, children
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-extrabold text-[#6f7b90] uppercase tracking-wider">
        {label}
        {optional && <span className="font-normal normal-case tracking-normal ml-1 opacity-70">(optional)</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500 font-semibold">{error}</span>}
    </div>
  );
}
