import { SATTest } from '../types/sat';
import { DOMAIN_META } from '../constants/domains';

export interface ParsedScoreResult {
  name: string;
  date: string;
  source: string;
  total: number;
  rw: number;
  math: number;
  notes?: string;
  domains: SATTest['domains'];
  confidence: 'high' | 'medium' | 'partial';
  detectedFields: string[];
}

export function parseBluebookReportText(rawText: string): ParsedScoreResult | null {
  if (!rawText || !rawText.trim()) return null;

  const text = rawText.trim();
  const detected: string[] = [];
  const domains: SATTest['domains'] = {};

  // 1. Detect Total, RW, and Math scores
  let total: number | null = null;
  let rw: number | null = null;
  let math: number | null = null;

  // Patterns for total score
  const totalMatch = text.match(/(?:Total\s*(?:Score)?:?|Overall:?|Composite:?)\s*(\d{3,4})/i) ||
                     text.match(/(\d{3,4})\s*(?:Total\s*Score|Total|Overall)/i);
  if (totalMatch) {
    const val = parseInt(totalMatch[1], 10);
    if (val >= 400 && val <= 1600) {
      total = val;
      detected.push(`Total Score: ${val}`);
    }
  }

  // Patterns for R&W score
  const rwMatch = text.match(/(?:Reading\s*(?:and|&)\s*Writing|RW|Reading\s*Writing|EBRW|ERW):?\s*(\d{3})/i) ||
                  text.match(/(\d{3})\s*(?:Reading\s*(?:and|&)\s*Writing|RW|EBRW)/i);
  if (rwMatch) {
    const val = parseInt(rwMatch[1], 10);
    if (val >= 200 && val <= 800) {
      rw = val;
      detected.push(`Reading & Writing: ${val}`);
    }
  }

  // Patterns for Math score
  const mathMatch = text.match(/(?:Math(?:ematics)?):?\s*(\d{3})/i) ||
                    text.match(/(\d{3})\s*(?:Math(?:ematics)?)/i);
  if (mathMatch) {
    const val = parseInt(mathMatch[1], 10);
    if (val >= 200 && val <= 800) {
      math = val;
      detected.push(`Math: ${val}`);
    }
  }

  // Auto-deduce if two out of three are present
  if (total && rw && !math) {
    math = total - rw;
    detected.push(`Math (calculated): ${math}`);
  } else if (total && math && !rw) {
    rw = total - math;
    detected.push(`R&W (calculated): ${rw}`);
  } else if (!total && rw && math) {
    total = rw + math;
    detected.push(`Total (calculated): ${total}`);
  }

  // If still missing essential components, we can't reliably build a test record
  if (!total || !rw || !math) {
    return null;
  }

  // 2. Detect Test Name
  let name = 'Imported Practice Test';
  const nameMatch = text.match(/(?:Bluebook|Practice\s*Test|SAT\s*Practice\s*Test|Official\s*SAT)\s*#?\s*(\d+|[A-Za-z0-9\-]+)/i);
  if (nameMatch) {
    name = `Bluebook Practice Test ${nameMatch[1]}`;
    detected.push(`Test Name: ${name}`);
  } else {
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 3 && firstLine.length < 50 && !firstLine.includes(':')) {
      name = firstLine;
      detected.push(`Test Name: ${name}`);
    }
  }

  // 3. Detect Date (YYYY-MM-DD or MM/DD/YYYY or Month DD, YYYY)
  let date = new Date().toISOString().split('T')[0];
  const isoDateMatch = text.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/);
  const usDateMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/);
  const textDateMatch = text.match(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/i);

  if (isoDateMatch) {
    const m = isoDateMatch[2].padStart(2, '0');
    const d = isoDateMatch[3].padStart(2, '0');
    date = `${isoDateMatch[1]}-${m}-${d}`;
    detected.push(`Date: ${date}`);
  } else if (usDateMatch) {
    const m = usDateMatch[1].padStart(2, '0');
    const d = usDateMatch[2].padStart(2, '0');
    date = `${usDateMatch[3]}-${m}-${d}`;
    detected.push(`Date: ${date}`);
  } else if (textDateMatch) {
    try {
      const parsed = new Date(`${textDateMatch[1]} ${textDateMatch[2]}, ${textDateMatch[3]}`);
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0];
        detected.push(`Date: ${date}`);
      }
    } catch {
      // Keep today's date
    }
  }

  // 4. Detect Domains
  for (const meta of DOMAIN_META) {
    // Regex for domain name followed by numbers, percentages, or fractions like "11/14"
    const escapedName = meta.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const domainRegex = new RegExp(`${escapedName}[^\\n\\r]{0,60}`, 'i');
    const match = text.match(domainRegex);

    if (match) {
      const segment = match[0];
      // Check for correct/total fraction e.g. 11/14 or 11 of 14
      const fracMatch = segment.match(/(\d{1,2})\s*(?:\/|\s+of\s+)\s*(\d{1,2})/i);
      // Check for percentage e.g. 75%
      const pctMatch = segment.match(/(\d{1,3})%/);
      // Check for scaled score e.g. 680 or score: 680
      const scoreMatch = segment.match(/(?:score:?\s*)?([2-8]\d{2})/i);

      let correct: number | null = null;
      let totalQ: number | null = null;
      let pct: number | null = null;
      let score: number | null = null;

      if (fracMatch) {
        correct = parseInt(fracMatch[1], 10);
        totalQ = parseInt(fracMatch[2], 10);
        if (totalQ > 0) {
          pct = Math.round((correct / totalQ) * 100);
        }
      }

      if (pctMatch && pct === null) {
        pct = parseInt(pctMatch[1], 10);
      }

      if (scoreMatch) {
        const sVal = parseInt(scoreMatch[1], 10);
        if (sVal >= 200 && sVal <= 800) {
          score = sVal;
        }
      }

      // If we have pct but no scaled score, estimate scaled score
      if (score === null && pct !== null) {
        score = Math.round(200 + (pct / 100) * 600);
      }

      if (correct !== null || pct !== null || score !== null) {
        domains[meta.id] = { correct, total: totalQ, pct, score };
        detected.push(`Domain (${meta.name}): ${pct != null ? `${pct}%` : ''} ${score != null ? `[Score: ${score}]` : ''}`);
      }
    }
  }

  return {
    name,
    date,
    source: text.toLowerCase().includes('bluebook') ? 'Bluebook Practice Test' : 'Official SAT (School Day / Weekend)',
    total,
    rw,
    math,
    notes: 'Imported via Bluebook / Score Report Importer',
    domains,
    confidence: Object.keys(domains).length >= 4 ? 'high' : 'medium',
    detectedFields: detected
  };
}
