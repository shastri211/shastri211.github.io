import type { CollectionEntry } from 'astro:content';

type Skill = CollectionEntry<'skills'>;

/** Display order of skill groups. Anything not listed here would be a schema error. */
export const SKILL_GROUPS: Skill['data']['group'][] = [
  'Languages',
  'Backend',
  'Retrieval and LLM systems',
  'Data and ML',
  'Datastores',
  'Frontend',
  'Infrastructure and tooling',
];

/** Skills grouped in the fixed group order, each group sorted by name. */
export function groupSkills(skills: Skill[]): Array<{ group: string; items: Skill[] }> {
  return SKILL_GROUPS.map((group) => ({
    group,
    items: skills
      .filter((s) => s.data.group === group)
      .sort((a, b) => a.data.name.localeCompare(b.data.name)),
  })).filter((g) => g.items.length > 0);
}
