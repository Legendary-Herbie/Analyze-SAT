export type SATSection = 'rw' | 'math';

export interface DomainMeta {
  id: string;
  name: string;
  section: SATSection;
  description?: string;
}

export interface DomainScoreData {
  correct?: number | null;
  total?: number | null;
  pct?: number | null;
  score?: number | null;
}

export interface ModuleRoutingData {
  rwModule2Difficulty?: 'hard' | 'easy' | null;
  mathModule2Difficulty?: 'hard' | 'easy' | null;
  rwModule1Correct?: number | null;
  rwModule2Correct?: number | null;
  mathModule1Correct?: number | null;
  mathModule2Correct?: number | null;
}

export interface SATTest {
  id: string;
  name: string;
  date: string;
  source: string;
  total: number;
  rw: number;
  math: number;
  notes?: string;
  domains: Record<string, DomainScoreData>;
  moduleRouting?: ModuleRoutingData;
  createdAt?: number;
}

export interface DomainTrend {
  domain: DomainMeta;
  latestScore: number | null;
  latestPct: number | null;
  averageScore: number | null;
  delta: number | null;
  deltaPct: number | null;
  scoresHistory: number[];
  assessment: 'Major strength' | 'Strong' | 'Developing' | 'Priority area' | 'No score';
}

export interface OfficialSATDate {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  season: string;
}

export interface StudyMilestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  type: 'test' | 'review' | 'rest';
  notes?: string;
}

export type SessionType = 'practice_test' | 'study_block';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface ScheduledSession {
  id: string;
  type: SessionType;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  durationMinutes: number;
  section?: SATSection | 'both';
  domainId?: string;
  priority: PriorityLevel;
  completed: boolean;
  notes?: string;
  isSuggested?: boolean;
  suggestionKey?: string;
  createdAt: number;
}

export interface PerformanceGapAnalysis {
  targetScore: number;
  currentScore: number;
  scoreGap: number;
  rwCurrent: number;
  mathCurrent: number;
  rwTarget: number;
  mathTarget: number;
  rwGap: number;
  mathGap: number;
  recommendedWeeklyHours: number;
  recommendedRWPercent: number;
  recommendedMathPercent: number;
  weakestDomains: {
    domainId: string;
    domainName: string;
    section: SATSection;
    latestScore: number | null;
    latestPct: number | null;
    gapPriority: 'critical' | 'moderate' | 'solid';
    reason: string;
  }[];
}

