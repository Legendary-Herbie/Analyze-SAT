import { DomainTrend, SATTest, ScheduledSession, PerformanceGapAnalysis, SATSection } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';

export function calculatePerformanceGaps(
  targetScore: number,
  latestTest: SATTest | null,
  superscore: { total: number; rw: number; math: number } | null,
  domainTrends: DomainTrend[]
): PerformanceGapAnalysis {
  const currentScore = latestTest?.total ?? (superscore?.total ?? 1350);
  const rwCurrent = latestTest?.rw ?? (superscore?.rw ?? 670);
  const mathCurrent = latestTest?.math ?? (superscore?.math ?? 680);

  const scoreGap = Math.max(0, targetScore - currentScore);

  // Balanced target distribution
  // If target is 1500, split fairly based on current performance
  const totalBothCurrent = rwCurrent + mathCurrent;
  let rwTarget = Math.round(targetScore * (rwCurrent / (totalBothCurrent || 1)));
  // Round to nearest 10
  rwTarget = Math.round(rwTarget / 10) * 10;
  rwTarget = Math.min(800, Math.max(200, rwTarget));
  const mathTarget = Math.min(800, Math.max(200, targetScore - rwTarget));

  const rwGap = Math.max(0, rwTarget - rwCurrent);
  const mathGap = Math.max(0, mathTarget - mathCurrent);

  // Recommended weekly hours based on score gap
  let recommendedWeeklyHours = 3.5; // Baseline maintenance
  if (scoreGap >= 120) {
    recommendedWeeklyHours = 8.5;
  } else if (scoreGap >= 80) {
    recommendedWeeklyHours = 7.0;
  } else if (scoreGap >= 40) {
    recommendedWeeklyHours = 5.5;
  } else if (scoreGap > 0) {
    recommendedWeeklyHours = 4.5;
  }

  // Recommended percentage split
  let recommendedRWPercent = 50;
  let recommendedMathPercent = 50;
  const totalSectionGap = rwGap + mathGap;
  if (totalSectionGap > 0) {
    recommendedRWPercent = Math.max(25, Math.min(75, Math.round((rwGap / totalSectionGap) * 100)));
    recommendedMathPercent = 100 - recommendedRWPercent;
  }

  // Identify domain gaps sorted by score / accuracy
  const scoredDomains = domainTrends.filter(d => d.latestScore != null || d.latestPct != null);

  const sortedDomains = [...(scoredDomains.length > 0 ? scoredDomains : domainTrends)].sort((a, b) => {
    const scoreA = a.latestScore ?? 650;
    const scoreB = b.latestScore ?? 650;
    if (scoreA !== scoreB) return scoreA - scoreB;
    const pctA = a.latestPct ?? 70;
    const pctB = b.latestPct ?? 70;
    return pctA - pctB;
  });

  const weakestDomains = sortedDomains.map(d => {
    const score = d.latestScore;
    const pct = d.latestPct;
    let gapPriority: 'critical' | 'moderate' | 'solid' = 'solid';
    let reason = 'Performing at or near target benchmarks.';

    if ((score != null && score < 630) || (pct != null && pct < 65)) {
      gapPriority = 'critical';
      reason = `Priority growth domain (${score ? `${score} pts` : `${pct}%`}). Highest leverage for score increase.`;
    } else if ((score != null && score < 690) || (pct != null && pct < 80)) {
      gapPriority = 'moderate';
      reason = `Developing domain (${score ? `${score} pts` : `${pct}%`}). Consistent review needed.`;
    } else {
      gapPriority = 'solid';
      reason = `Current strength (${score ? `${score} pts` : `${pct}%`}). Focus on speed and avoiding careless traps.`;
    }

    return {
      domainId: d.domain.id,
      domainName: d.domain.name,
      section: d.domain.section,
      latestScore: score,
      latestPct: pct,
      gapPriority,
      reason,
    };
  });

  return {
    targetScore,
    currentScore,
    scoreGap,
    rwCurrent,
    mathCurrent,
    rwTarget,
    mathTarget,
    rwGap,
    mathGap,
    recommendedWeeklyHours,
    recommendedRWPercent,
    recommendedMathPercent,
    weakestDomains,
  };
}

// Generate smart suggested sessions based on analysis
export function generateSuggestedSessions(
  gaps: PerformanceGapAnalysis,
  testsCount: number
): Omit<ScheduledSession, 'id' | 'createdAt' | 'completed'>[] {
  const suggestions: Omit<ScheduledSession, 'id' | 'createdAt' | 'completed'>[] = [];

  const today = new Date();

  // Helper to format date relative to today
  const getRelativeDate = (daysAhead: number): string => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // 1. Next Full Practice Test (usually scheduled for this weekend or next Saturday)
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextTestDate = getRelativeDate(daysUntilSaturday);
  const nextTestNum = testsCount + 1;

  suggestions.push({
    type: 'practice_test',
    title: `Full Practice Test #${nextTestNum} (Timed Simulation)`,
    date: nextTestDate,
    time: '09:00',
    durationMinutes: 134,
    section: 'both',
    priority: 'high',
    notes: 'Simulate official testing conditions. Strict 64 min R&W + 70 min Math with 10 min break. Complete in Bluebook.',
    isSuggested: true,
    suggestionKey: `sug-practice-test-${nextTestNum}`,
  });

  // 2. Weakest Domain #1 Study Block
  const weakest1 = gaps.weakestDomains[0];
  if (weakest1) {
    const meta = DOMAIN_META.find(m => m.id === weakest1.domainId);
    suggestions.push({
      type: 'study_block',
      title: `${weakest1.domainName} Targeted Drill`,
      date: getRelativeDate(2),
      time: '16:30',
      durationMinutes: 45,
      section: weakest1.section,
      domainId: weakest1.domainId,
      priority: 'high',
      notes: `Dedicated focus on your biggest gap area. ${meta?.description || 'Review underlying concepts, drill 15 hard practice questions, and document mistake patterns.'}`,
      isSuggested: true,
      suggestionKey: `sug-domain-${weakest1.domainId}`,
    });
  }

  // 3. Weakest Domain in Opposite Section (balanced study)
  const oppositeSection: SATSection = weakest1?.section === 'math' ? 'rw' : 'math';
  const weakestOpposite = gaps.weakestDomains.find(d => d.section === oppositeSection);
  if (weakestOpposite) {
    suggestions.push({
      type: 'study_block',
      title: `${weakestOpposite.domainName} Skill Builder`,
      date: getRelativeDate(4),
      time: '17:00',
      durationMinutes: 45,
      section: weakestOpposite.section,
      domainId: weakestOpposite.domainId,
      priority: 'medium',
      notes: `Balance your preparation across both sections. Drill timed question sets and reinforce core test strategies.`,
      isSuggested: true,
      suggestionKey: `sug-domain-${weakestOpposite.domainId}`,
    });
  }

  // 4. Desmos Speed Calculator or Error Log Review
  suggestions.push({
    type: 'study_block',
    title: 'Desmos Speed Drill & Error Log Analysis',
    date: getRelativeDate(5),
    time: '15:00',
    durationMinutes: 35,
    section: 'math',
    domainId: 'algebra',
    priority: 'medium',
    notes: 'Master graphing intersections, table regressions, and systems of equations on the built-in Desmos calculator.',
    isSuggested: true,
    suggestionKey: 'sug-strategy-desmos',
  });

  return suggestions;
}

// Generate initial sample sessions if user has none saved
export function getInitialSampleSessions(
  gaps: PerformanceGapAnalysis,
  testsCount: number
): ScheduledSession[] {
  const suggestions = generateSuggestedSessions(gaps, testsCount);
  return suggestions.map((s, index) => ({
    ...s,
    id: `sched-init-${index + 1}`,
    completed: false,
    createdAt: Date.now() - index * 60000,
  }));
}

// Generate an iCalendar (.ics) file string from scheduled sessions
export function generateICalendarData(sessions: ScheduledSession[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital SAT Performance Tracker//Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  sessions.forEach(session => {
    if (session.completed) return; // Only export active upcoming sessions

    const dateClean = session.date.replace(/-/g, '');
    const timeClean = (session.time || '09:00').replace(':', '') + '00';
    const dtStart = `${dateClean}T${timeClean}`;

    // Calculate end time
    const startObj = new Date(`${session.date}T${session.time || '09:00'}:00`);
    const endObj = new Date(startObj.getTime() + session.durationMinutes * 60000);
    const endYear = endObj.getFullYear();
    const endMonth = String(endObj.getMonth() + 1).padStart(2, '0');
    const endDay = String(endObj.getDate()).padStart(2, '0');
    const endHour = String(endObj.getHours()).padStart(2, '0');
    const endMin = String(endObj.getMinutes()).padStart(2, '0');
    const dtEnd = `${endYear}${endMonth}${endDay}T${endHour}${endMin}00`;

    const summary = session.type === 'practice_test'
      ? `[SAT Practice Test] ${session.title}`
      : `[SAT Study Block] ${session.title}`;

    const description = [
      `Type: ${session.type === 'practice_test' ? 'Official Practice Test Simulation' : 'Targeted Study Block'}`,
      `Duration: ${session.durationMinutes} minutes`,
      session.priority ? `Priority: ${session.priority.toUpperCase()}` : '',
      session.notes ? `Notes: ${session.notes}` : '',
      'Scheduled via Digital SAT Performance Tracker',
    ].filter(Boolean).join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:sat-session-${session.id}@sattracker.local`,
      `DTSTAMP:${dateClean}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadCalendarFile(sessions: ScheduledSession[]) {
  const icsData = generateICalendarData(sessions);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `sat-study-schedule-${new Date().toISOString().split('T')[0]}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
