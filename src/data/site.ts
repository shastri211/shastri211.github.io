/** Identity, contact and external links. The single place to change any of them. */
export const site = {
  name: 'Chavi Shastri',
  url: 'https://shastri211.github.io',
  title: 'Chavi Shastri — backend and retrieval systems for language models',
  description:
    'Chavi Shastri builds backend and retrieval systems around language models: job queues, hybrid search, provider fallbacks, evals and tests. Case studies link to the code.',
  /** The one line under the name in the header and in structured data. */
  jobTitle: 'Software engineering student',
  email: 'shastrichavi2114@gmail.com',
  location: 'Indore, India',
  links: {
    github: 'https://github.com/shastri211',
    linkedin: 'https://www.linkedin.com/in/chavi-shastri-2256a427a/',
    /** Served from /public. Remove the file and this link disappears from the UI. */
    resume: '/Chavi-Shastri-Resume.pdf',
    source: 'https://github.com/shastri211/shastri211.github.io',
  },
  /** Repositories whose recent activity is shown on the home page. */
  activityRepos: ['shastri211/Hiring_Automation', 'shastri211/knavis', 'shastri211/RetainAI'],
} as const;

export type Site = typeof site;
