// Refreshes src/data/github-snapshot.json from the public GitHub API.
// The site build reads live data first and falls back to this file, so a rate limit or an
// offline build never produces an empty "latest activity" section.
//
//   node scripts/snapshot-activity.mjs            (uses GITHUB_TOKEN if set)
import { writeFileSync } from 'node:fs';

const repos = ['shastri211/Hiring_Automation', 'shastri211/knavis', 'shastri211/RetainAI'];
const headers = { accept: 'application/vnd.github+json', 'user-agent': 'portfolio-build' };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const items = [];
for (const repo of repos) {
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=3`, { headers });
  if (!res.ok) throw new Error(`${repo}: ${res.status} ${res.statusText}`);
  for (const c of await res.json()) {
    items.push({
      repo,
      date: c.commit.committer.date,
      message: c.commit.message.split('\n')[0],
      url: c.html_url,
    });
  }
}
items.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(
  new URL('../src/data/github-snapshot.json', import.meta.url),
  JSON.stringify({ fetchedAt: new Date().toISOString(), items }, null, 2) + '\n',
);
console.log(`wrote ${items.length} items`);
