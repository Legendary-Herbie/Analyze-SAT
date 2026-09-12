import { SATTest } from '../types/sat';

export type CalloutType = 'jump' | 'plateau' | 'dip' | 'gain';

export interface ScoreTrendCallout {
  id: string;
  type: CalloutType;
  fromIndex: number;
  toIndex: number;
  fromTest: SATTest;
  toTest: SATTest;
  totalDelta: number;
  rwDelta: number;
  mathDelta: number;
  daysApart: number | null;
  severity: 'positive' | 'warning' | 'negative' | 'neutral';
  title: string;
  badgeLabel: string;
  summary: string;
  drivers: {
    primarySection: 'rw' | 'math' | 'balanced';
    text: string;
  };
  actionableGuidance: string;
  recommendedFocus?: string;
}

/**
 * Automatically identifies significant score movements or stagnation
 * between consecutive tests (chronologically sorted).
 */
export function detectScoreTrendCallouts(orderedTests: SATTest[]): ScoreTrendCallout[] {
  if (!orderedTests || orderedTests.length < 2) return [];

  const callouts: ScoreTrendCallout[] = [];

  for (let i = 1; i < orderedTests.length; i++) {
    const prev = orderedTests[i - 1];
    const curr = orderedTests[i];
    const totalDelta = curr.total - prev.total;
    const rwDelta = curr.rw - prev.rw;
    const mathDelta = curr.math - prev.math;

    let daysApart: number | null = null;
    if (prev.date && curr.date) {
      const d1 = new Date(prev.date).getTime();
      const d2 = new Date(curr.date).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        daysApart = Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      }
    }

    // 1. Significant Jump: total delta >= 40 OR either section surged >= 40 with positive total
    if (totalDelta >= 40 || (rwDelta >= 40 && totalDelta >= 20) || (mathDelta >= 40 && totalDelta >= 20)) {
      let primary: 'rw' | 'math' | 'balanced' = 'balanced';
      if (rwDelta > mathDelta + 15) primary = 'rw';
      else if (mathDelta > rwDelta + 15) primary = 'math';

      let guidance = '';
      let focus = '';

      if (primary === 'rw') {
        guidance = `Reading & Writing drove this surge (+${rwDelta} pts). Lock in your current passage strategy and time allocation, then shift your next study blocks toward Math to sustain compound gains.`;
        focus = 'Shift drill blocks to Math while keeping R&W active';
      } else if (primary === 'math') {
        guidance = `Math propelled this jump (+${mathDelta} pts). The concepts studied clearly paid off. Reinforce these problem templates, and dedicate 15 minutes daily to R&W vocabulary and grammar rules.`;
        focus = 'Reinforce Math retention and maintain R&W fundamentals';
      } else {
        guidance = `Synchronized growth across both sections (+${rwDelta} pts RW, +${mathDelta} pts Math). Demonstrates solid overall testing stamina and balanced preparation. Keep this pacing for future mocks.`;
        focus = 'Maintain balanced practice pacing and review remaining mistakes';
      }

      callouts.push({
        id: `jump-${prev.id}-${curr.id}`,
        type: 'jump',
        fromIndex: i - 1,
        toIndex: i,
        fromTest: prev,
        toTest: curr,
        totalDelta,
        rwDelta,
        mathDelta,
        daysApart,
        severity: 'positive',
        title: `+${totalDelta} Point Breakthrough`,
        badgeLabel: `+${totalDelta} pts Surge`,
        summary: `${curr.name} leaped +${totalDelta} points over ${prev.name} (${prev.total} → ${curr.total}).`,
        drivers: {
          primarySection: primary,
          text: `R&W: ${rwDelta >= 0 ? `+${rwDelta}` : rwDelta} pts | Math: ${mathDelta >= 0 ? `+${mathDelta}` : mathDelta} pts`
        },
        actionableGuidance: guidance,
        recommendedFocus: focus
      });
    }
    // 2. Score Plateau: flat movement (within -15 to +15 pts)
    else if (Math.abs(totalDelta) <= 15) {
      let guidance = '';
      let focus = '';

      if (rwDelta >= 20 && mathDelta <= -20) {
        guidance = `Section score trade-off: Reading & Writing rose (+${rwDelta} pts) while Math dropped (${mathDelta} pts), flattening the composite score. Dedicate your next prep cycle to restoring Math performance.`;
        focus = 'Rebalance focus toward Math domain drills';
      } else if (mathDelta >= 20 && rwDelta <= -20) {
        guidance = `Section score trade-off: Math advanced (+${mathDelta} pts) while Reading & Writing dipped (${rwDelta} pts), masking individual progress. Spend your next session targeting R&W question stems.`;
        focus = 'Rebalance focus toward Reading & Writing question pacing';
      } else {
        guidance = `Scores plateaued (${prev.total} → ${curr.total}, Δ ${totalDelta >= 0 ? `+${totalDelta}` : totalDelta} pts). Stagnation often signals a ceiling with general full-test practice. Action: Switch from whole mock tests to targeted 15-minute drills on Module 2 Hard difficulty questions and error logging.`;
        focus = 'Target Module 2 Hard questions & categorize recurring error patterns';
      }

      callouts.push({
        id: `plateau-${prev.id}-${curr.id}`,
        type: 'plateau',
        fromIndex: i - 1,
        toIndex: i,
        fromTest: prev,
        toTest: curr,
        totalDelta,
        rwDelta,
        mathDelta,
        daysApart,
        severity: 'warning',
        title: totalDelta === 0 ? 'Exact Score Plateau' : `Score Plateau (${totalDelta > 0 ? `+${totalDelta}` : totalDelta} pts)`,
        badgeLabel: `Plateau (${totalDelta >= 0 ? `+${totalDelta}` : totalDelta} pts)`,
        summary: `Score remained stagnant at ${curr.total} between ${prev.name} and ${curr.name}.`,
        drivers: {
          primarySection: Math.abs(rwDelta) > Math.abs(mathDelta) ? 'rw' : 'math',
          text: `R&W: ${rwDelta >= 0 ? `+${rwDelta}` : rwDelta} pts | Math: ${mathDelta >= 0 ? `+${mathDelta}` : mathDelta} pts`
        },
        actionableGuidance: guidance,
        recommendedFocus: focus
      });
    }
    // 3. Significant Dip / Setback: total delta <= -30
    else if (totalDelta <= -30) {
      let primary: 'rw' | 'math' | 'balanced' = 'balanced';
      if (rwDelta < mathDelta - 15) primary = 'rw';
      else if (mathDelta < rwDelta - 15) primary = 'math';

      const guidance = `Score dropped by ${Math.abs(totalDelta)} points. Sharp score declines are frequently driven by fatigue, pacing rushes in Module 2, or test-day anxiety rather than lost ability. Action: Review the mistake triage to separate careless calculation/reading errors from genuine concept gaps.`;

      callouts.push({
        id: `dip-${prev.id}-${curr.id}`,
        type: 'dip',
        fromIndex: i - 1,
        toIndex: i,
        fromTest: prev,
        toTest: curr,
        totalDelta,
        rwDelta,
        mathDelta,
        daysApart,
        severity: 'negative',
        title: `${totalDelta} Point Score Dip`,
        badgeLabel: `${totalDelta} pts Dip`,
        summary: `Score dropped from ${prev.total} down to ${curr.total} on ${curr.name}.`,
        drivers: {
          primarySection: primary,
          text: `R&W: ${rwDelta} pts | Math: ${mathDelta} pts`
        },
        actionableGuidance: guidance,
        recommendedFocus: 'Mistake triage & pacing review to eliminate unforced errors'
      });
    }
    // 4. Moderate Progress: +16 to +39
    else if (totalDelta > 15 && totalDelta < 40) {
      callouts.push({
        id: `gain-${prev.id}-${curr.id}`,
        type: 'gain',
        fromIndex: i - 1,
        toIndex: i,
        fromTest: prev,
        toTest: curr,
        totalDelta,
        rwDelta,
        mathDelta,
        daysApart,
        severity: 'neutral',
        title: `+${totalDelta} Steady Progress`,
        badgeLabel: `+${totalDelta} pts`,
        summary: `Steady progress from ${prev.total} to ${curr.total}.`,
        drivers: {
          primarySection: rwDelta > mathDelta ? 'rw' : 'math',
          text: `R&W: ${rwDelta >= 0 ? `+${rwDelta}` : rwDelta} pts | Math: ${mathDelta >= 0 ? `+${mathDelta}` : mathDelta} pts`
        },
        actionableGuidance: `Consistent forward movement. Continue sharpening your highest-frequency question domains to push past the +40 point milestone on your next mock.`,
        recommendedFocus: 'Target developing domains to convert to strengths'
      });
    }
  }

  return callouts;
}
