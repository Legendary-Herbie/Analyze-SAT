import { DomainTrend } from '../types/sat';

export interface PathwayRecommendation {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  targetRW: number;
  targetMath: number;
  deltaRW: number;
  deltaMath: number;
  questionsNeededRW: number;
  questionsNeededMath: number;
  feasibility: 'High Probability' | 'Moderate' | 'Demanding' | 'Completed';
  keyDomainsToTarget: string[];
  strategicAdvice: string;
}

export function calculateSuperscorePathways(
  currentSuperscore: { rw: number; math: number; total: number } | null,
  targetScore: number,
  domainTrends: DomainTrend[]
): {
  pointsNeeded: number;
  rwHeadroom: number;
  mathHeadroom: number;
  pathways: PathwayRecommendation[];
} {
  const currentRW = currentSuperscore?.rw ?? 500;
  const currentMath = currentSuperscore?.math ?? 500;
  const currentTotal = currentSuperscore?.total ?? 1000;

  const pointsNeeded = Math.max(0, targetScore - currentTotal);
  const rwHeadroom = Math.max(0, 800 - currentRW);
  const mathHeadroom = Math.max(0, 800 - currentMath);

  // Identify lowest performing domains in R&W and Math
  const rwWeakDomains = domainTrends
    .filter(d => d.domain.section === 'rw' && (d.latestScore != null || d.latestPct != null))
    .sort((a, b) => (a.latestPct ?? a.latestScore ?? 0) - (b.latestPct ?? b.latestScore ?? 0))
    .slice(0, 2)
    .map(d => d.domain.name);

  const mathWeakDomains = domainTrends
    .filter(d => d.domain.section === 'math' && (d.latestScore != null || d.latestPct != null))
    .sort((a, b) => (a.latestPct ?? a.latestScore ?? 0) - (b.latestPct ?? b.latestScore ?? 0))
    .slice(0, 2)
    .map(d => d.domain.name);

  if (pointsNeeded === 0) {
    return {
      pointsNeeded: 0,
      rwHeadroom,
      mathHeadroom,
      pathways: [
        {
          id: 'goal-met',
          name: 'Target Achieved',
          badge: 'Goal Reached',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          description: `Your superscore (${currentTotal}) already meets or exceeds your goal (${targetScore})!`,
          targetRW: currentRW,
          targetMath: currentMath,
          deltaRW: 0,
          deltaMath: 0,
          questionsNeededRW: 0,
          questionsNeededMath: 0,
          feasibility: 'Completed',
          keyDomainsToTarget: [],
          strategicAdvice: 'Consider bumping your goal to challenge yourself, or practice full-length test endurance.'
        }
      ]
    };
  }

  const pathways: PathwayRecommendation[] = [];

  // Pathway 1: High-Probability / Math Leverage
  // Math is generally recognized by test prep experts as the fastest score yield because of Desmos and concrete algebraic rules.
  let p1DeltaMath = Math.min(mathHeadroom, Math.ceil((pointsNeeded * 0.65) / 10) * 10);
  let p1DeltaRW = pointsNeeded - p1DeltaMath;
  if (p1DeltaRW > rwHeadroom) {
    p1DeltaRW = rwHeadroom;
    p1DeltaMath = pointsNeeded - p1DeltaRW;
  }
  const p1TargetMath = currentMath + p1DeltaMath;
  const p1TargetRW = currentRW + p1DeltaRW;

  pathways.push({
    id: 'math-leverage',
    name: 'The High-Yield Math Pathway',
    badge: 'Fastest Route ⚡',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    description: 'Prioritizes Math point gains where Desmos graphing shortcuts and algebraic rules deliver the most reliable point increase per study hour.',
    targetRW: p1TargetRW,
    targetMath: p1TargetMath,
    deltaRW: p1DeltaRW,
    deltaMath: p1DeltaMath,
    questionsNeededRW: Math.max(0, Math.ceil(p1DeltaRW / 15)),
    questionsNeededMath: Math.max(0, Math.ceil(p1DeltaMath / 15)),
    feasibility: p1DeltaMath <= 70 ? 'High Probability' : 'Moderate',
    keyDomainsToTarget: mathWeakDomains.length > 0 ? mathWeakDomains : ['Algebra', 'Advanced Math'],
    strategicAdvice: 'Master Desmos regression (y1 ~ mx1 + b) and quadratic roots. +2 to +4 correct Math questions will close the gap quickly.'
  });

  // Pathway 2: Balanced 50/50 Split
  const halfPoints = Math.ceil(pointsNeeded / 2 / 10) * 10;
  let p2DeltaRW = Math.min(rwHeadroom, halfPoints);
  let p2DeltaMath = pointsNeeded - p2DeltaRW;
  if (p2DeltaMath > mathHeadroom) {
    p2DeltaMath = mathHeadroom;
    p2DeltaRW = pointsNeeded - p2DeltaMath;
  }
  const p2TargetRW = currentRW + p2DeltaRW;
  const p2TargetMath = currentMath + p2DeltaMath;

  pathways.push({
    id: 'balanced-growth',
    name: 'Dual Section Balanced Growth',
    badge: 'Balanced ⚖️',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    description: 'Evenly distributes the remaining point requirements across both sections to minimize reliance on perfection in any single module.',
    targetRW: p2TargetRW,
    targetMath: p2TargetMath,
    deltaRW: p2DeltaRW,
    deltaMath: p2DeltaMath,
    questionsNeededRW: Math.max(0, Math.ceil(p2DeltaRW / 15)),
    questionsNeededMath: Math.max(0, Math.ceil(p2DeltaMath / 15)),
    feasibility: 'Moderate',
    keyDomainsToTarget: [
      ...(rwWeakDomains.slice(0, 1)),
      ...(mathWeakDomains.slice(0, 1))
    ],
    strategicAdvice: 'Focus on Standard English punctuation rules (semicolons vs commas) alongside your top math weak spot.'
  });

  // Pathway 3: Reading & Writing Sprint (if RW headroom is sufficient)
  if (rwHeadroom >= 30) {
    const p3DeltaRW = Math.min(rwHeadroom, pointsNeeded);
    const p3DeltaMath = pointsNeeded - p3DeltaRW;
    const p3TargetRW = currentRW + p3DeltaRW;
    const p3TargetMath = currentMath + p3DeltaMath;

    pathways.push({
      id: 'verbal-sprint',
      name: 'Reading & Writing Sprint',
      badge: 'Verbal Focus 📖',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      description: 'Drives maximum point recovery in Reading & Writing, targeting grammatical syntax rules and rhetorical transitions.',
      targetRW: p3TargetRW,
      targetMath: p3TargetMath,
      deltaRW: p3DeltaRW,
      deltaMath: p3DeltaMath,
      questionsNeededRW: Math.max(0, Math.ceil(p3DeltaRW / 15)),
      questionsNeededMath: Math.max(0, Math.ceil(p3DeltaMath / 15)),
      feasibility: p3DeltaRW <= 80 ? 'Moderate' : 'Demanding',
      keyDomainsToTarget: rwWeakDomains.length > 0 ? rwWeakDomains : ['Standard English Conventions', 'Craft and Structure'],
      strategicAdvice: 'Standard English Conventions and Expression of Ideas are 100% rule-based. Review transition word logic and pronoun consistency.'
    });
  }

  return {
    pointsNeeded,
    rwHeadroom,
    mathHeadroom,
    pathways
  };
}
