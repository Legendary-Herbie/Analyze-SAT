import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, Trash2, FileJson, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useSAT } from '../context/SATContext';
import { ConfirmDialog } from './ConfirmDialog';

interface DataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose }) => {
  const { exportJSON, exportCSV, resetToSample, clearAllTests, importTests, tests } = useSAT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const result = importTests(data);
        if (result.success) {
          showToast('success', result.message);
          onClose();
        } else {
          showToast('error', result.message);
        }
      } catch {
        showToast('error', 'Failed to parse JSON. Make sure the file was exported from this app.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteReset = () => {
    resetToSample();
    showToast('success', 'Reset to sample data.');
    setConfirmAction(null);
    onClose();
  };

  const handleExecuteClear = () => {
    clearAllTests();
    showToast('success', 'All tests cleared.');
    setConfirmAction(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.65)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-[#182235] dark:text-slate-100">Data & Export</h2>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">Manage your test data, import or export.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {/* Info bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#f6f8fb] dark:bg-slate-800/60 border border-[#e5e9f0] dark:border-slate-700 rounded-xl">
            <span className="text-xs text-[#6f7b90] dark:text-slate-400">Stored tests</span>
            <span className="text-sm font-extrabold text-[#2c4160] dark:text-indigo-400">
              {tests.length} record{tests.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400 mb-1">
              Export
            </div>

            <button
              onClick={() => {
                exportJSON();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/80 border border-[#e5e9f0] dark:border-slate-700 hover:border-[#c8d0db] dark:hover:border-slate-600 hover:bg-[#f6f8fb] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-700 flex items-center justify-center shrink-0">
                <FileJson className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#182235] dark:text-white">Export as JSON</div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400">Full data backup — can be re-imported</div>
              </div>
              <Download className="w-4 h-4 text-[#6f7b90] dark:text-slate-400 ml-auto" />
            </button>

            <button
              onClick={() => {
                exportCSV();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/80 border border-[#e5e9f0] dark:border-slate-700 hover:border-[#c8d0db] dark:hover:border-slate-600 hover:bg-[#f6f8fb] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#182235] dark:text-white">Export as CSV</div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400">Open in Excel, Google Sheets, etc.</div>
              </div>
              <Download className="w-4 h-4 text-[#6f7b90] dark:text-slate-400 ml-auto" />
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6f7b90] dark:text-slate-400 mb-1">
              Import & Reset
            </div>

            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/80 border border-[#e5e9f0] dark:border-slate-700 hover:border-[#c8d0db] dark:hover:border-slate-600 hover:bg-[#f6f8fb] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-[#2c4160] dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#182235] dark:text-white">Import JSON</div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400">Restore a previously exported backup</div>
              </div>
            </button>

            <button
              onClick={() => setConfirmAction('reset')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/80 border border-[#e5e9f0] dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#182235] dark:text-white">Reset to Sample Data</div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400">Restore the built-in Bluebook example tests</div>
              </div>
            </button>

            <button
              onClick={() => setConfirmAction('clear')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/80 border border-[#e5e9f0] dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-600 dark:text-red-400">Clear All Tests</div>
                <div className="text-xs text-[#6f7b90] dark:text-slate-400">Permanently delete all saved data</div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 pb-5">
          <p className="text-center text-[10px] text-[#6f7b90] dark:text-slate-500">
            All data is stored in your browser's local storage — private and secure.
          </p>
        </div>
      </div>

      {/* In-app reliable confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmAction === 'reset'}
        title="Reset to Sample Data?"
        message="Your current test records will be replaced with official College Board Bluebook practice samples. This cannot be undone."
        confirmLabel="Reset Data"
        variant="warning"
        onConfirm={handleExecuteReset}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        isOpen={confirmAction === 'clear'}
        title="Clear All Test Records?"
        message="Are you sure you want to permanently delete ALL recorded tests? This will clear all score trends, history, and domain metrics."
        confirmLabel="Clear Everything"
        variant="danger"
        onConfirm={handleExecuteClear}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 transition-all ${
            toast.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
