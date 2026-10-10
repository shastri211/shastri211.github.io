export interface Education {
  institution: string;
  programme: string;
  years: string;
  note?: string;
}

export const education: Education[] = [
  {
    institution: 'International Institute of Professional Studies (IIPS), DAVV, Indore',
    programme: 'M.Tech (Integrated) in Information Technology',
    years: '2022 – 2027',
  },
  {
    institution: 'Jawahar Navodaya Vidyalaya, Ratlam',
    programme: 'Secondary and higher secondary',
    years: '2019 – 2022',
  },
];

export interface JourneyStep {
  when: string;
  title: string;
  body: string;
  /** Project slug this step links to, when one exists. */
  project?: string;
}

/**
 * The short version of how the work progressed. Every step is dated from a commit,
 * a certificate or the resume; nothing here is a claim about skill level.
 */
export const journey: JourneyStep[] = [
  {
    when: '2024',
    title: 'A template site and Python coursework',
    body: 'First portfolio: three data-preparation assignments and self-rated skill bars. This site replaces it.',
  },
  {
    when: 'Nov 2025',
    title: 'Sahaay, a rule-based support chatbot',
    body: 'A Flask chatbot for English, Hindi and Hinglish conversations. Its working code is not in a public repository, so there is no case study.',
  },
  {
    when: 'Jan – Feb 2026',
    title: 'Data foundations',
    body: 'IBM SkillsBuild data courses and BCG X and Deloitte job simulations, to get comfortable reading and presenting data.',
  },
  {
    when: 'Aug 2026',
    title: 'Retrieval prototypes, and an internship',
    body: 'A dense-only retrieval prototype, later rebuilt with hybrid search. Started as an AI intern at Onetab the same month.',
  },
  {
    when: 'Sep 2026',
    title: 'A multi-tenant hiring platform',
    body: 'Hiring Automation went into version control with CI, a Redis Streams worker and tenant-isolation tests. I also built the frontends for a teammate’s RecruitAI pipeline.',
    project: 'hiring-automation',
  },
  {
    when: 'Oct 2026',
    title: 'Evaluation, written down',
    body: 'KNAVIS shipped with a 56-question eval and a CI gate. RetainAI was validated with intervals, calibration and a stability study.',
    project: 'knavis',
  },
];
