import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertCircle, ArrowRight, Clipboard } from 'lucide-react';
import { parseBluebookReportText, ParsedScoreResult } from '../utils/scoreImporter';
import { useSAT } from '../context/SATContext';

interface ScoreReportImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_BLUEBOOK_PASTE = `Bluebook Practice Test 6
Test Date: 2026-09-02
Total Score: 1470
Reading and Writing: 710
Math: 760

Skill & Domain Breakdown:
Information and Ideas: 12/14 (86%)
Craft and Structure: 11/13 (85%)
Expression of Ideas: 10/12 (83%)
Standard English Conventions: 11/12 (92%)
Algebra: 13/13 (100%)
Advanced Math: 11/13 (85%)
Problem-Solving and Data Analysis: 9/10 (90%)
Geometry and Trigonometry: 7/8 (88%)`;

export const ScoreReportImporterModal: React.FC<ScoreReportImporterModalProps> = ({ isOpen, onClose }) => {
  const { addTest } = useSAT();
  const [pastedText, setPastedText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedScoreResult | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    setHasAttempted(true);
    const result = parseBluebookReportText(textToParse);
    setParsedResult(result);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPastedText(text);
    if (text.trim().length > 10) {
      handleParse(text);
    } else {
      setParsedResult(null);
      setHasAttempted(false);
    }
  };

  const handleLoadSample = () => {
    setPastedText(SAMPLE_BLUEBOOK_PASTE);
    handleParse(SAMPLE_BLUEBOOK_PASTE);
  };

  const handleSaveImport = () => {
    if (!parsedResult) return;

    addTest({
      name: parsedResult.name,
      date: parsedResult.date,
      source: parsedResult.source,
      total: parsedResult.total,
      rw: parsedResult.rw,
      math: parsedResult.math,
      notes: parsedResult.notes,
      domains: parsedResult.domains
    });

    setToastMessage(`Imported "${parsedResult.name}" successfully!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(11, 17, 32, 0.6)' }}
    >
      <div className="bg-white dark:bg-slate-900 border border-[#e5e9f0] dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e9f0] dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 mb-1.5">
              <Sparkles className="w-3 h-3" />
              Smart Report Importer
            </div>
            <h2 className="text-xl font-black text-[#182235] dark:text-slate-100">
              Bluebook / College Board Importer
            </h2>
            <p className="text-xs text-[#6f7b90] dark:text-slate-400 mt-1">
              Paste text directly from your Bluebook practice test review or score PDF.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#eef2f7] dark:bg-slate-800 hover:bg-[#e5e9f0] dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-[#405978] dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#6f7b90] dark:text-slate-400">
              Paste Score Text or Bluebook Report
            </label>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#2c4160] dark:text-indigo-400 hover:underline"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Load sample report
            </button>
          </div>

          <textarea
            value={pastedText}
            onChange={handleTextChange}
            placeholder="Paste your Bluebook review screen text here, for example:&#10;&#10;Bluebook Practice Test 5&#10;Total Score: 1420&#10;Reading and Writing: 680&#10;Math: 740&#10;Algebra: 12/13..."
            rows={5}
            className="form-input resize-y font-mono text-xs"
          />

          {/* Parsing Feedback */}
          {hasAttempted && !parsedResult && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Could not detect both section scores. Make sure the text includes either Total + one section, or both Reading & Writing and Math scores.</span>
            </div>
          )}

          {parsedResult && (
            <div className="bg-[#f6f8fb] dark:bg-slate-800/40 border border-[#e5e9f0] dark:border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Successfully Parsed Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {parsedResult.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>

              {/* Detected Score Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-[#e5e9f0] dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 uppercase">Total</span>
                  <div className="text-xl font-black text-[#182235] dark:text-white mt-0.5">{parsedResult.total}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-[#e5e9f0] dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 uppercase">R&W</span>
                  <div className="text-xl font-black text-[#2c4160] dark:text-indigo-400 mt-0.5">{parsedResult.rw}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-[#e5e9f0] dark:border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 uppercase">Math</span>
                  <div className="text-xl font-black text-[#2c4160] dark:text-indigo-400 mt-0.5">{parsedResult.math}</div>
                </div>
              </div>

              {/* Metadata row */}
              <div className="flex items-center justify-between text-xs text-[#6f7b90] dark:text-slate-400 pt-1">
                <div>Test: <strong className="text-[#182235] dark:text-slate-200">{parsedResult.name}</strong></div>
                <div>Date: <strong className="text-[#182235] dark:text-slate-200">{parsedResult.date}</strong></div>
              </div>

              {/* Detected Domains */}
              {Object.keys(parsedResult.domains).length > 0 && (
                <div className="pt-2 border-t border-[#e5e9f0] dark:border-slate-700">
                  <span className="text-[10px] font-bold text-[#6f7b90] dark:text-slate-400 uppercase block mb-1.5">
                    {Object.keys(parsedResult.domains).length} Domain Breakdowns Detected
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(parsedResult.domains).map(([id, d]) => (
                      <span
                        key={id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-[#e5e9f0] dark:border-slate-700 text-[#405978] dark:text-slate-300"
                      >
                        {id}: {d?.pct != null ? `${d.pct}%` : `${d?.correct}/${d?.total}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e9f0] dark:border-slate-800 bg-[#fafbfc] dark:bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#405978] dark:text-slate-400 hover:text-[#182235] dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveImport}
            disabled={!parsedResult}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-[#2c4160] hover:bg-[#243955] dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm active:scale-95"
          >
            <span>Add Test to Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {toastMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg z-50 animate-bounce">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
