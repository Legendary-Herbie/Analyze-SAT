import { SATTest } from '../types/sat';

export const SAMPLE_TESTS: SATTest[] = [
  {
    id: 'sample-test-1',
    name: 'Bluebook Practice Test 1',
    date: '2026-07-10',
    source: 'Bluebook Practice Test',
    total: 1220,
    rw: 580,
    math: 640,
    notes: 'Diagnostic baseline. Ran out of time on Reading Module 2 and got routed to Easy Module 2 in R&W. Careless algebra errors in Math.',
    moduleRouting: {
      rwModule2Difficulty: 'easy',
      mathModule2Difficulty: 'hard',
      rwModule1Correct: 15,
      rwModule2Correct: 18,
      mathModule1Correct: 17,
      mathModule2Correct: 13
    },
    mistakes: [
      { id: 'm-1', questionNumber: 'R-14', section: 'rw', domainId: 'craft', reason: 'time', notes: 'Rushed through vocabulary in context; did not read surrounding context clues.' },
      { id: 'm-2', questionNumber: 'R-22', section: 'rw', domainId: 'info', reason: 'misread', notes: 'Confused correlation with causation in science passage hypothesis.' },
      { id: 'm-3', questionNumber: 'M-18', section: 'math', domainId: 'algebra', reason: 'careless', notes: 'Forgot negative sign when distributing through parenthesis.' },
      { id: 'm-4', questionNumber: 'M-21', section: 'math', domainId: 'advanced', reason: 'content', notes: 'Did not recognize completing the square vertex form for parabola.' }
    ],
    domains: {
      info: { correct: 8, total: 14, pct: 57, score: 570 },
      craft: { correct: 6, total: 13, pct: 46, score: 530 },
      expression: { correct: 7, total: 12, pct: 58, score: 580 },
      english: { correct: 8, total: 12, pct: 67, score: 620 },
      algebra: { correct: 10, total: 13, pct: 77, score: 660 },
      advanced: { correct: 7, total: 13, pct: 54, score: 580 },
      problem: { correct: 7, total: 10, pct: 70, score: 640 },
      geometry: { correct: 5, total: 8, pct: 63, score: 620 }
    }
  },
  {
    id: 'sample-test-2',
    name: 'Bluebook Practice Test 2',
    date: '2026-07-28',
    source: 'Bluebook Practice Test',
    total: 1330,
    rw: 640,
    math: 690,
    notes: 'Major surge (+110 pts)! Qualified for Hard Module 2 in both sections. Desmos graphing saved 6 minutes on Math linear systems.',
    moduleRouting: {
      rwModule2Difficulty: 'hard',
      mathModule2Difficulty: 'hard',
      rwModule1Correct: 20,
      rwModule2Correct: 16,
      mathModule1Correct: 19,
      mathModule2Correct: 15
    },
    mistakes: [
      { id: 'm-5', questionNumber: 'R-8', section: 'rw', domainId: 'craft', reason: 'content', notes: 'Tricky secondary definition of "temper" as to moderate or soften.' },
      { id: 'm-6', questionNumber: 'M-19', section: 'math', domainId: 'geometry', reason: 'time', notes: 'Spent 3 minutes solving circle equation by hand instead of typing in Desmos.' }
    ],
    domains: {
      info: { correct: 10, total: 14, pct: 71, score: 630 },
      craft: { correct: 8, total: 13, pct: 62, score: 600 },
      expression: { correct: 9, total: 12, pct: 75, score: 660 },
      english: { correct: 10, total: 12, pct: 83, score: 680 },
      algebra: { correct: 12, total: 13, pct: 92, score: 730 },
      advanced: { correct: 9, total: 13, pct: 69, score: 650 },
      problem: { correct: 8, total: 10, pct: 80, score: 690 },
      geometry: { correct: 6, total: 8, pct: 75, score: 660 }
    }
  },
  {
    id: 'sample-test-3',
    name: 'Bluebook Practice Test 3',
    date: '2026-08-15',
    source: 'Bluebook Practice Test',
    total: 1340,
    rw: 620,
    math: 720,
    notes: 'Score plateaued (+10 pts). Math surged to 720 (+30 pts) with zero algebra errors, but R&W dipped to 620 (-20 pts) due to archaic vocabulary in Craft & Structure. Classic section trade-off.',
    moduleRouting: {
      rwModule2Difficulty: 'hard',
      mathModule2Difficulty: 'hard',
      rwModule1Correct: 19,
      rwModule2Correct: 14,
      mathModule1Correct: 21,
      mathModule2Correct: 17
    },
    mistakes: [
      { id: 'm-7', questionNumber: 'R-4', section: 'rw', domainId: 'craft', reason: 'content', notes: 'Unfamiliar archaic idiom in 19th-century historical speech passage.' },
      { id: 'm-8', questionNumber: 'R-13', section: 'rw', domainId: 'craft', reason: 'misread', notes: 'Overlooked the word "except" in negative factual question stem.' },
      { id: 'm-9', questionNumber: 'R-25', section: 'rw', domainId: 'expression', reason: 'careless', notes: 'Picked transition "furthermore" instead of contrast "nonetheless".' },
      { id: 'm-10', questionNumber: 'M-22', section: 'math', domainId: 'advanced', reason: 'time', notes: 'Ran out of time on final grid-in exponent question.' }
    ],
    domains: {
      info: { correct: 10, total: 14, pct: 71, score: 630 },
      craft: { correct: 7, total: 13, pct: 54, score: 570 },
      expression: { correct: 8, total: 12, pct: 67, score: 620 },
      english: { correct: 10, total: 12, pct: 83, score: 680 },
      algebra: { correct: 13, total: 13, pct: 100, score: 770 },
      advanced: { correct: 10, total: 13, pct: 77, score: 690 },
      problem: { correct: 9, total: 10, pct: 90, score: 720 },
      geometry: { correct: 6, total: 8, pct: 75, score: 670 }
    }
  },
  {
    id: 'sample-test-4',
    name: 'Bluebook Practice Test 4',
    date: '2026-09-02',
    source: 'Bluebook Practice Test',
    total: 1480,
    rw: 720,
    math: 760,
    notes: 'Breakthrough! Target score of 1500 is within 20 points, and superscore reaches 1480! Targeted Craft & Structure drills eliminated vocabulary traps.',
    moduleRouting: {
      rwModule2Difficulty: 'hard',
      mathModule2Difficulty: 'hard',
      rwModule1Correct: 25,
      rwModule2Correct: 23,
      mathModule1Correct: 22,
      mathModule2Correct: 20
    },
    mistakes: [
      { id: 'm-11', questionNumber: 'R-26', section: 'rw', domainId: 'info', reason: 'time', notes: 'Rushed the dual-text synthesis question in the final 45 seconds.' },
      { id: 'm-12', questionNumber: 'M-21', section: 'math', domainId: 'geometry', reason: 'careless', notes: 'Used diameter instead of radius in sphere volume formula.' }
    ],
    domains: {
      info: { correct: 12, total: 14, pct: 86, score: 720 },
      craft: { correct: 11, total: 13, pct: 85, score: 710 },
      expression: { correct: 11, total: 12, pct: 92, score: 740 },
      english: { correct: 11, total: 12, pct: 92, score: 730 },
      algebra: { correct: 13, total: 13, pct: 100, score: 790 },
      advanced: { correct: 12, total: 13, pct: 92, score: 750 },
      problem: { correct: 10, total: 10, pct: 100, score: 770 },
      geometry: { correct: 7, total: 8, pct: 88, score: 730 }
    }
  }
];
