import { DomainMeta } from '../types/sat';

export const DOMAIN_META: DomainMeta[] = [
  {
    id: 'info',
    name: 'Information and Ideas',
    section: 'rw',
    description: 'Locating, interpreting, evaluating, and integrating information and ideas from texts and infographics.'
  },
  {
    id: 'craft',
    name: 'Craft and Structure',
    section: 'rw',
    description: 'Words in context, text structure and purpose, and cross-text connections.'
  },
  {
    id: 'expression',
    name: 'Expression of Ideas',
    section: 'rw',
    description: 'Rhetorical synthesis and transitions to revise text for rhetorical effectiveness.'
  },
  {
    id: 'english',
    name: 'Standard English Conventions',
    section: 'rw',
    description: 'Sentence structure, usage, and punctuation conventions.'
  },
  {
    id: 'algebra',
    name: 'Algebra',
    section: 'math',
    description: 'Linear equations, inequalities, systems of equations, and linear functions.'
  },
  {
    id: 'advanced',
    name: 'Advanced Math',
    section: 'math',
    description: 'Equivalent expressions, quadratic, exponential, polynomial, and other nonlinear equations.'
  },
  {
    id: 'problem',
    name: 'Problem-Solving and Data Analysis',
    section: 'math',
    description: 'Ratios, rates, proportional relationships, unit rates, percentages, and data distributions.'
  },
  {
    id: 'geometry',
    name: 'Geometry and Trigonometry',
    section: 'math',
    description: 'Area, volume, lines, angles, triangles, trigonometry, and circle theorems.'
  }
];

export const TEST_SOURCES = [
  'Bluebook Practice Test',
  'Khan Academy',
  'Official SAT (School Day / Weekend)',
  'Princeton Review',
  'Kaplan',
  'DSAT UZ',
  'UWorld',
  'Erica Meltzer / College Panda',
  'Other'
];

/**
 * Calculates domain score based on College Board Digital SAT formula:
 * Domain Score = 200 + 600 * (Correct / Total)
 * Used to calculate domain scores when omitted.
 */
export function calculateDomainScore(
  correct: number | null | undefined,
  total: number | null | undefined
): number | null {
  if (
    correct == null ||
    total == null ||
    total <= 0 ||
    isNaN(Number(correct)) ||
    isNaN(Number(total))
  ) {
    return null;
  }
  const rawScore = 200 + 600 * (Number(correct) / Number(total));
  return Math.min(800, Math.max(200, Math.round(rawScore)));
}

/**
 * Returns the effective domain score: uses domain.score if present,
 * or calculates from 200 + 600 * (Correct / Total) when omitted.
 */
export function getEffectiveDomainScore(
  domainData: { score?: number | null; correct?: number | null; total?: number | null } | undefined | null
): number | null {
  if (!domainData) return null;
  if (typeof domainData.score === 'number' && !isNaN(domainData.score)) {
    return domainData.score;
  }
  if (domainData.correct != null && domainData.total != null && domainData.total > 0) {
    return calculateDomainScore(domainData.correct, domainData.total);
  }
  return null;
}

/**
 * Returns the effective domain accuracy percentage: uses domain.pct if present,
 * or calculates Math.round((correct / total) * 100) if omitted.
 */
export function getEffectiveDomainPct(
  domainData: { pct?: number | null; correct?: number | null; total?: number | null } | undefined | null
): number | null {
  if (!domainData) return null;
  if (typeof domainData.pct === 'number' && !isNaN(domainData.pct)) {
    return domainData.pct;
  }
  if (domainData.correct != null && domainData.total != null && domainData.total > 0) {
    return Math.round((Number(domainData.correct) / Number(domainData.total)) * 100);
  }
  return null;
}
