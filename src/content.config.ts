import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'use YYYY-MM');
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD');

/**
 * A number that appears on the site. Every metric has to say where it came from and
 * what limits it, so nothing can be published as a bare figure.
 */
const metric = z.object({
  label: z.string(),
  value: z.string(),
  source: z
    .string()
    .describe('Path in the repository, or a short description of where it was measured'),
  sourceUrl: z.url().optional(),
  caveat: z.string().min(12, 'every metric needs a real caveat'),
});

/** A claim paired with the thing that backs it. */
const evidence = z.object({
  claim: z.string(),
  proof: z.string(),
  href: z.url().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().max(180),
    summary: z.string().max(420),
    description: z.string().max(170).describe('Meta description for search and sharing'),
    kind: z.enum(['flagship', 'project', 'collaboration', 'meta']),
    status: z.enum(['working', 'validated', 'prototype', 'archived']),
    statusNote: z.string(),
    period: z.object({ start: month, end: month.optional() }),
    role: z.string(),
    collaborators: z
      .array(z.object({ name: z.string(), contribution: z.string(), url: z.url().optional() }))
      .default([]),
    stack: z.array(z.object({ group: z.string(), items: z.array(z.string()).min(1) })),
    /** The few technologies that distinguish the project, shown in lists. */
    highlights: z.array(z.string()).min(2).max(5),
    links: z.object({
      repo: z.url().optional(),
      demo: z.url().optional(),
    }),
    /** Pinned commit used for the permalinks on the page. */
    pinned: z.object({ repo: z.string(), commit: z.string().regex(/^[0-9a-f]{7,40}$/) }).optional(),
    order: z.number().int(),
    metrics: z.array(metric).default([]),
    evidence: z.array(evidence).default([]),
    notClaimed: z.array(z.string()).default([]),
    builtWith: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const skills = defineCollection({
  loader: file('./src/content/data/skills.json'),
  schema: z.object({
    name: z.string(),
    group: z.enum([
      'Languages',
      'Backend',
      'Retrieval and LLM systems',
      'Data and ML',
      'Datastores',
      'Frontend',
      'Infrastructure and tooling',
    ]),
    /** A technology can only be listed if at least one project actually used it. */
    usedIn: z.array(reference('projects')).min(1, 'a skill needs at least one project as evidence'),
    note: z.string().optional(),
  }),
});

const experience = defineCollection({
  loader: file('./src/content/data/experience.json'),
  schema: z.object({
    organization: z.string(),
    role: z.string(),
    start: month,
    end: month.optional(),
    summary: z.string(),
    work: z.array(z.string()).min(1),
    stack: z.array(z.string()).default([]),
    note: z.string().optional(),
  }),
});

const certifications = defineCollection({
  loader: file('./src/content/data/certifications.json'),
  schema: z.object({
    title: z.string(),
    issuer: z.string(),
    issued: day,
    kind: z.enum(['course', 'job-simulation', 'program']),
    verifyUrl: z.url().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { projects, skills, experience, certifications };
