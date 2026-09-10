export interface ModuleSimulationResult {
  section: 'rw' | 'math';
  totalQuestionsM1: number;
  totalQuestionsM2: number;
  m1Threshold: number;
  isHardModuleUnlocked: boolean;
  scoreCeiling: number;
  estimatedScoreMin: number;
  estimatedScoreMax: number;
  statusBadge: string;
  statusColor: string;
  advice: string[];
}

export function simulateModuleRouting(
  section: 'rw' | 'math',
  module1Correct: number,
  module2Correct?: number | null
): ModuleSimulationResult {
  if (section === 'rw') {
    const totalQuestionsM1 = 27;
    const totalQuestionsM2 = 27;
    const m1Threshold = 18; // ~67% accuracy needed for harder module

    const isHardModuleUnlocked = module1Correct >= m1Threshold;
    const scoreCeiling = isHardModuleUnlocked ? 800 : 590;

    // Estimate score
    let estimatedScoreMin = 200;
    let estimatedScoreMax = scoreCeiling;

    const m2Count = module2Correct ?? (isHardModuleUnlocked ? 16 : 20);

    if (isHardModuleUnlocked) {
      // Hard module range: ~480 - 800
      // 25 scored in M1, 25 scored in M2
      const totalEstimatedCorrect = Math.min(50, Math.round((module1Correct / 27) * 25 + (m2Count / 27) * 25));
      const baseline = 480;
      const range = 800 - baseline;
      const score = Math.round(baseline + (totalEstimatedCorrect / 50) * range);
      estimatedScoreMin = Math.max(480, score - 30);
      estimatedScoreMax = Math.min(800, score + 30);
    } else {
      // Easy module range: ~200 - 590
      const totalEstimatedCorrect = Math.min(50, Math.round((module1Correct / 27) * 25 + (m2Count / 27) * 25));
      const score = Math.round(200 + (totalEstimatedCorrect / 50) * 390);
      estimatedScoreMin = Math.max(200, score - 30);
      estimatedScoreMax = Math.min(590, score + 20);
    }

    // Round to nearest 10
    estimatedScoreMin = Math.round(estimatedScoreMin / 10) * 10;
    estimatedScoreMax = Math.round(estimatedScoreMax / 10) * 10;

    return {
      section: 'rw',
      totalQuestionsM1,
      totalQuestionsM2,
      m1Threshold,
      isHardModuleUnlocked,
      scoreCeiling,
      estimatedScoreMin,
      estimatedScoreMax,
      statusBadge: isHardModuleUnlocked ? 'Harder Module 2 Unlocked 🚀' : 'Easier Module 2 (Score Capped) ⚠️',
      statusColor: isHardModuleUnlocked
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      advice: isHardModuleUnlocked
        ? [
            'Full 800 ceiling is unlocked. Mistakes in harder Module 2 carry less penalty than in Module 1.',
            'Maintain pacing in Module 2: do grammar & rhetoric first (Q15–27) to bank quick points before dense reading passages.',
            'Never leave any question blank—the Digital SAT has no guessing penalty.'
          ]
        : [
            `You missed the hard module cutoff (~${m1Threshold}/27). Your Reading & Writing score is capped at ~590 regardless of Module 2 perfection.`,
            'High-Yield Fix: Questions 15–27 in Module 1 are Standard English Conventions & Transitions. Getting these 100% right ensures you unlock the Hard Module.',
            'Do not linger on long vocabulary/cross-text questions in Module 1 at the expense of easy grammar points.'
          ]
    };
  } else {
    // Math Section
    const totalQuestionsM1 = 22;
    const totalQuestionsM2 = 22;
    const m1Threshold = 15; // ~68% accuracy needed for harder module

    const isHardModuleUnlocked = module1Correct >= m1Threshold;
    const scoreCeiling = isHardModuleUnlocked ? 800 : 570;

    let estimatedScoreMin = 200;
    let estimatedScoreMax = scoreCeiling;

    const m2Count = module2Correct ?? (isHardModuleUnlocked ? 14 : 17);

    if (isHardModuleUnlocked) {
      const totalEstimatedCorrect = Math.min(40, Math.round((module1Correct / 22) * 20 + (m2Count / 22) * 20));
      const baseline = 470;
      const range = 800 - baseline;
      const score = Math.round(baseline + (totalEstimatedCorrect / 40) * range);
      estimatedScoreMin = Math.max(470, score - 30);
      estimatedScoreMax = Math.min(800, score + 30);
    } else {
      const totalEstimatedCorrect = Math.min(40, Math.round((module1Correct / 22) * 20 + (m2Count / 22) * 20));
      const score = Math.round(200 + (totalEstimatedCorrect / 40) * 370);
      estimatedScoreMin = Math.max(200, score - 30);
      estimatedScoreMax = Math.min(570, score + 20);
    }

    estimatedScoreMin = Math.round(estimatedScoreMin / 10) * 10;
    estimatedScoreMax = Math.round(estimatedScoreMax / 10) * 10;

    return {
      section: 'math',
      totalQuestionsM1,
      totalQuestionsM2,
      m1Threshold,
      isHardModuleUnlocked,
      scoreCeiling,
      estimatedScoreMin,
      estimatedScoreMax,
      statusBadge: isHardModuleUnlocked ? 'Harder Module 2 Unlocked 🚀' : 'Easier Module 2 (Score Capped) ⚠️',
      statusColor: isHardModuleUnlocked
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      advice: isHardModuleUnlocked
        ? [
            'Maximum 800 potential unlocked! Hard Module 2 will test multi-step geometry and nonlinear algebra.',
            'Keep Desmos open side-by-side for rapid graph intersections, circle equations, and regression.',
            'Student-produced response (grid-in) questions have no partial credit—double check negative signs.'
          ]
        : [
            `Scored below ~${m1Threshold}/22 in Module 1. Your Math score is capped around ~570 even with 100% on Module 2.`,
            'Triage Strategy: Use Desmos aggressively for linear systems and function evaluation on Module 1 to guarantee 16+ correct.',
            'Careless calculation slips on early easy questions are the #1 cause of failing to unlock Hard Module 2.'
          ]
    };
  }
}
