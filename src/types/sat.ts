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

