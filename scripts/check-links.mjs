// Post-build link check over dist/.
//   internal links  must resolve to a file in dist/
//   external links  must answer 2xx or 3xx (LinkedIn blocks bots with 999 and is reported, not failed)
//   GitHub blob permalinks with a line range (#L21-L74) must exist, and the file at that
//   commit must really have that many lines, so an evidence link cannot point past the end
//
//   npm run build && node scripts/check-links.mjs
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '..', 'dist');
if (!existsSync(dist)) throw new Error('dist/ not found. Run the build first.');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const pages = walk(dist).filter((f) => f.endsWith('.html'));
const internal = new Map();
const external = new Map();

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"#][^"]*|#[^"]*)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('data:')) continue;
    const bucket = /^https?:\/\//.test(url) ? external : internal;
    if (!bucket.has(url)) bucket.set(url, file.replace(dist, ''));
  }
}

const siteOrigin = readFileSync(
  join(import.meta.dirname, '..', 'src', 'data', 'site.ts'),
  'utf8',
).match(/url: '([^']+)'/)?.[1];
const problems = [];
const notes = [];
let ownOrigin = 0;

for (const [url, from] of internal) {
  if (url.startsWith('#')) continue;
  const path = url.split('#')[0].split('?')[0];
  const target = join(dist, path);
  const candidates = [target, join(target, 'index.html'), `${target}.html`];
  if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) {
    problems.push(`internal  ${url}  (linked from ${from})`);
  }
}

const headers = { 'user-agent': 'portfolio-link-check', accept: '*/*' };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function request(url, method) {
  return fetch(url, { method, headers, redirect: 'follow', signal: AbortSignal.timeout(20000) });
}

async function checkExternal(url, from) {
  // The site's own canonical and social URLs cannot resolve until the site is deployed.
  if (siteOrigin && url.startsWith(siteOrigin)) return void ownOrigin++;
  try {
    let res = await request(url, 'HEAD');
    if (res.status === 405 || res.status === 403 || res.status === 400)
      res = await request(url, 'GET');
    if (res.status === 999) return notes.push(`blocks bots (999)  ${url}`);
    if (res.status >= 400) return problems.push(`${res.status}  ${url}  (linked from ${from})`);

    const blob = url.match(
      /^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([0-9a-f]{7,40})\/([^#]+)#L(\d+)(?:-L(\d+))?$/,
    );
    if (blob) {
      const [, repo, sha, path, start, end] = blob;
      const raw = await request(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`, 'GET');
      if (!raw.ok) return problems.push(`${raw.status}  raw file for ${url}`);
      const lines = (await raw.text()).split('\n').length;
      const last = Number(end ?? start);
      if (last > lines) problems.push(`line ${last} is past the end (${lines} lines)  ${url}`);
    }
  } catch (error) {
    problems.push(`${String(error.cause?.code ?? error.name)}  ${url}  (linked from ${from})`);
  }
}

const queue = [...external];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const [url, from] = queue.shift();
      await checkExternal(url, from);
    }
  }),
);

console.log(
  `${pages.length} pages, ${internal.size} internal and ${external.size} external links checked.`,
);
for (const n of notes) console.log(`note: ${n}`);
if (ownOrigin)
  console.log(
    `note: ${ownOrigin} own-origin URLs (canonical and social) are skipped; verify them after deploy.`,
  );
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('No broken links.');
