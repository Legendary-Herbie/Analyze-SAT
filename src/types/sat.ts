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
