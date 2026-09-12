import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SATTest, DomainTrend } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';
import { SAMPLE_TESTS } from '../constants/sampleData';

const STORAGE_KEY = 'satTrackerTestsV3';
const TARGET_KEY = 'satTrackerTargetScore';

interface SATContextType {
  tests: SATTest[];
  orderedTests: SATTest[];
  latestTest: SATTest | null;
  previousTest: SATTest | null;
  personalBest: number | null;
  averageScore: number | null;
  superscore: { total: number; rw: number; math: number } | null;
  scoreDelta: number | null;
  rwDelta: number | null;
  mathDelta: number | null;
  domainTrends: DomainTrend[];
  targetScore: number;
  setTargetScore: (score: number) => void;
  addTest: (test: Omit<SATTest, 'id'>) => void;
  updateTest: (id: string, test: Partial<SATTest>) => void;
  deleteTest: (id: string) => void;
  resetToSample: () => void;
  clearAllTests: () => void;
  importTests: (importedData: SATTest[]) => { success: boolean; message: string };
  exportJSON: () => void;
  exportCSV: () => void;
}

const SATContext = createContext<SATContextType | undefined>(undefined);

export function getAssessment(score: number | null | undefined): DomainTrend['assessment'] {
  if (score == null) return 'No score';
  if (score >= 730) return 'Major strength';
  if (score >= 680) return 'Strong';
  if (score >= 630) return 'Developing';
  return 'Priority area';
}

export const SATProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<SATTest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load tests from local storage', e);
    }
    // Default state of the website is empty
    return [];
  });

  const [targetScore, setTargetScoreState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(TARGET_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= 400 && parsed <= 1600) return parsed;
      }
    } catch (e) {
      console.error('Failed to load target score', e);
    }
    return 1500;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
    } catch (e) {
      console.error('Failed to save tests to local storage', e);
    }
  }, [tests]);

  const setTargetScore = (score: number) => {
    setTargetScoreState(score);
    localStorage.setItem(TARGET_KEY, score.toString());
  };

  const orderedTests = useMemo(() => {
    return [...tests].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : (a.createdAt || 0);
      const timeB = b.date ? new Date(b.date).getTime() : (b.createdAt || 0);
      return timeA - timeB;
    });
  }, [tests]);

  const latestTest = useMemo(() => {
    return orderedTests.length > 0 ? orderedTests[orderedTests.length - 1] : null;
  }, [orderedTests]);

  const previousTest = useMemo(() => {
    return orderedTests.length > 1 ? orderedTests[orderedTests.length - 2] : null;
  }, [orderedTests]);

  const personalBest = useMemo(() => {
    if (tests.length === 0) return null;
    return Math.max(...tests.map(t => t.total));
  }, [tests]);

  const averageScore = useMemo(() => {
    if (tests.length === 0) return null;
    const sum = tests.reduce((acc, t) => acc + t.total, 0);
    return Math.round(sum / tests.length);
  }, [tests]);

  const superscore = useMemo(() => {
    if (tests.length === 0) return null;
    const maxRW = Math.max(...tests.map(t => t.rw));
    const maxMath = Math.max(...tests.map(t => t.math));
    return {
      rw: maxRW,
      math: maxMath,
      total: maxRW + maxMath
    };
  }, [tests]);

  const scoreDelta = useMemo(() => {
    if (!latestTest || !previousTest) return null;
    return latestTest.total - previousTest.total;
  }, [latestTest, previousTest]);

  const rwDelta = useMemo(() => {
    if (!latestTest || !previousTest) return null;
    return latestTest.rw - previousTest.rw;
  }, [latestTest, previousTest]);

  const mathDelta = useMemo(() => {
    if (!latestTest || !previousTest) return null;
    return latestTest.math - previousTest.math;
  }, [latestTest, previousTest]);

  const domainTrends = useMemo<DomainTrend[]>(() => {
    return DOMAIN_META.map(domain => {
      const scoresHistory = orderedTests
        .map(t => t.domains?.[domain.id]?.score)
        .filter((s): s is number => typeof s === 'number' && !isNaN(s));

      const pctHistory = orderedTests
        .map(t => t.domains?.[domain.id]?.pct)
        .filter((p): p is number => typeof p === 'number' && !isNaN(p));

      const latestScore = latestTest?.domains?.[domain.id]?.score ?? null;
      const latestPct = latestTest?.domains?.[domain.id]?.pct ?? null;

      const averageScore = scoresHistory.length > 0
        ? Math.round(scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length)
        : null;

      const delta = scoresHistory.length > 1
        ? scoresHistory[scoresHistory.length - 1] - scoresHistory[scoresHistory.length - 2]
        : null;

      const deltaPct = pctHistory.length > 1
        ? pctHistory[pctHistory.length - 1] - pctHistory[pctHistory.length - 2]
        : null;

      return {
        domain,
        latestScore,
        latestPct,
        averageScore,
        delta,
        deltaPct,
        scoresHistory,
        assessment: getAssessment(latestScore)
      };
    });
  }, [orderedTests, latestTest]);

  const addTest = (testData: Omit<SATTest, 'id'>) => {
    const newTest: SATTest = {
      ...testData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setTests(prev => [...prev, newTest]);
  };

  const updateTest = (id: string, testData: Partial<SATTest>) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, ...testData } : t));
  };

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const resetToSample = () => {
    setTests(SAMPLE_TESTS);
  };

  const clearAllTests = () => {
    setTests([]);
  };

  const importTests = (importedData: any[]): { success: boolean; message: string } => {
    if (!Array.isArray(importedData)) {
      return { success: false, message: 'Import file must contain an array of tests.' };
    }

    const validated: SATTest[] = [];
    for (const item of importedData) {
      if (!item || typeof item !== 'object') continue;
      const total = Number(item.total);
      const rw = Number(item.rw);
      const math = Number(item.math);

      if (isNaN(total) || isNaN(rw) || isNaN(math)) continue;

      validated.push({
        id: item.id || crypto.randomUUID(),
        name: item.name || 'Practice Test',
        date: item.date || '',
        source: item.source || 'Other',
        total,
        rw,
        math,
        notes: item.notes || '',
        moduleRouting: item.moduleRouting,
        mistakes: item.mistakes,
        domains: item.domains || {},
        createdAt: item.createdAt || Date.now()
      });
    }

    if (validated.length === 0) {
      return { success: false, message: 'No valid test records found in the JSON file.' };
    }

    setTests(validated);
    return { success: true, message: `Successfully imported ${validated.length} test records.` };
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(tests, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sat-performance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (tests.length === 0) return;
    
    // Header columns
    const headers = [
      'Test Name',
      'Date',
      'Source',
      'Total Score',
      'Reading & Writing',
      'Math',
      'Notes',
      ...DOMAIN_META.map(d => `${d.name} Score`),
      ...DOMAIN_META.map(d => `${d.name} Accuracy %`)
    ];

    const rows = orderedTests.map(t => {
      const domainScores = DOMAIN_META.map(d => t.domains?.[d.id]?.score ?? '');
      const domainPcts = DOMAIN_META.map(d => t.domains?.[d.id]?.pct ?? '');
      return [
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.date}"`,
        `"${(t.source || '').replace(/"/g, '""')}"`,
        t.total,
        t.rw,
        t.math,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
        ...domainScores,
        ...domainPcts
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sat-scores-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SATContext.Provider
      value={{
        tests,
        orderedTests,
        latestTest,
        previousTest,
        personalBest,
        averageScore,
        superscore,
        scoreDelta,
        rwDelta,
        mathDelta,
        domainTrends,
        targetScore,
        setTargetScore,
        addTest,
        updateTest,
        deleteTest,
        resetToSample,
        clearAllTests,
        importTests,
        exportJSON,
        exportCSV
      }}
    >
      {children}
    </SATContext.Provider>
  );
};

export const useSAT = () => {
  const context = useContext(SATContext);
  if (!context) {
    throw new Error('useSAT must be used within a SATProvider');
  }
  return context;
};
