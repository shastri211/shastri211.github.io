import type { CollectionEntry } from 'astro:content';

type Project = CollectionEntry<'projects'>;

export interface SectionSpec {
  id: string;
  title: string;
}

/** The structure every full case study follows. */
export const FULL_SECTIONS: SectionSpec[] = [
  { id: 'context', title: 'Context' },
  { id: 'objective', title: 'Objective' },
  { id: 'approach', title: 'Approach' },
  { id: 'architecture', title: 'Architecture' },
  { id: 'engineering', title: 'Engineering' },
  { id: 'challenges', title: 'Challenges' },
  { id: 'trade-offs', title: 'Trade-offs' },
  { id: 'result', title: 'Result' },
  { id: 'evidence', title: 'Evidence' },
  { id: 'reflection', title: 'Reflection' },
];

/** A collaboration entry is shorter: it covers only what the author actually built. */
export const SHORT_SECTIONS: SectionSpec[] = FULL_SECTIONS.filter((s) =>
  ['context', 'approach', 'engineering', 'result', 'evidence', 'reflection'].includes(s.id),
);

export const requiredSections = (project: Project): SectionSpec[] =>
  project.data.kind === 'collaboration' ? SHORT_SECTIONS : FULL_SECTIONS;

/** Sections actually present in the MDX body, in document order. */
export function sectionsIn(project: Project): SectionSpec[] {
  const found: SectionSpec[] = [];
  for (const m of (project.body ?? '').matchAll(/<Section\s+id="([^"]+)"\s+title="([^"]+)"/g)) {
    found.push({ id: m[1]!, title: m[2]! });
  }
  return found;
}

/**
 * Build-time gate: a case study that skips a required section, or publishes without a
 * "not claimed" list, fails the build instead of shipping half-finished.
 */
export function assertCaseStudy(project: Project): void {
  const have = new Set(sectionsIn(project).map((s) => s.id));
  const missing = requiredSections(project)
    .filter((s) => !have.has(s.id))
    .map((s) => s.id);
  const problems: string[] = [];
  if (missing.length) problems.push(`missing sections: ${missing.join(', ')}`);
  if (project.data.notClaimed.length === 0) problems.push('notClaimed is empty');
  if (problems.length) {
    throw new Error(`Case study "${project.id}" is incomplete: ${problems.join('; ')}`);
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09" becomes "Sep 2026". Written by hand because Intl abbreviates September as "Sept". */
export const formatMonth = (value: string): string => {
  const [year, month] = value.split('-').map(Number);
  return `${MONTHS[month! - 1]} ${year}`;
};

export const formatPeriod = (period: Project['data']['period']): string => {
  if (!period.end) return `${formatMonth(period.start)} – present`;
  if (period.end === period.start) return formatMonth(period.start);
  return `${formatMonth(period.start)} – ${formatMonth(period.end)}`;
};

export const byOrder = (a: Project, b: Project): number => a.data.order - b.data.order;

export const statusLabel: Record<Project['data']['status'], string> = {
  working: 'Working',
  validated: 'Validated',
  prototype: 'Prototype',
  archived: 'Archived',
};
