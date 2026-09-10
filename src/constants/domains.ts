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
