import { SATTest } from '../types/sat';

export const SAMPLE_TESTS: SATTest[] = [
  {
    id: 'test-1',
    name: 'Bluebook Practice Test 1',
    date: '2026-07-15',
    source: 'Bluebook Practice Test',
    total: 1320,
    rw: 630,
    math: 690,
    notes: 'Diagnostic baseline test. Struggled with time management on Reading Module 2.',
    domains: {
      info: { correct: 9, total: 14, pct: 64, score: 600 },
      craft: { correct: 8, total: 13, pct: 62, score: 590 },
      expression: { correct: 8, total: 12, pct: 67, score: 620 },
      english: { correct: 9, total: 12, pct: 75, score: 650 },
      algebra: { correct: 11, total: 13, pct: 85, score: 710 },
      advanced: { correct: 8, total: 13, pct: 62, score: 610 },
      problem: { correct: 8, total: 10, pct: 80, score: 690 },
      geometry: { correct: 5, total: 8, pct: 63, score: 620 }
    }
  },
  {
    id: 'test-2',
    name: 'Bluebook Practice Test 4',
    date: '2026-08-12',
    source: 'Bluebook Practice Test',
    total: 1380,
    rw: 660,
    math: 720,
    notes: 'Improved in Algebra and English punctuation.',
    domains: {
      info: { correct: 10, total: 14, pct: 71, score: 635 },
      craft: { correct: 10, total: 13, pct: 77, score: 655 },
      expression: { correct: 8, total: 12, pct: 67, score: 610 },
      english: { correct: 9, total: 12, pct: 75, score: 650 },
      algebra: { correct: 12, total: 13, pct: 92, score: 755 },
      advanced: { correct: 9, total: 13, pct: 69, score: 640 },
      problem: { correct: 8, total: 10, pct: 80, score: 690 },
      geometry: { correct: 6, total: 8, pct: 75, score: 665 }
    }
  },
  {
    id: 'test-3',
    name: 'Bluebook Practice Test 5',
    date: '2026-08-24',
    source: 'Bluebook Practice Test',
    total: 1430,
    rw: 690,
    math: 740,
    notes: 'Significant increase in Craft & Structure and Advanced Math.',
    domains: {
      info: { correct: 11, total: 14, pct: 79, score: 671 },
      craft: { correct: 11, total: 13, pct: 85, score: 710 },
      expression: { correct: 9, total: 12, pct: 75, score: 652 },
      english: { correct: 9, total: 12, pct: 75, score: 650 },
      algebra: { correct: 12, total: 13, pct: 92, score: 760 },
      advanced: { correct: 10, total: 13, pct: 77, score: 688 },
      problem: { correct: 9, total: 10, pct: 90, score: 735 },
      geometry: { correct: 6, total: 8, pct: 75, score: 670 }
    }
  }
];
