import snapshot from '@/data/github-snapshot.json';
import { site } from '@/data/site';

export interface ActivityItem {
  repo: string;
  date: string;
  message: string;
  url: string;
}

export interface Activity {
  items: ActivityItem[];
  source: 'live' | 'snapshot';
  asOf: string;
}

const PER_REPO = 2;
const LIMIT = 6;

async function fetchRepo(repo: string, token: string | undefined): Promise<ActivityItem[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': 'portfolio-build',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=${PER_REPO}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${repo}: ${res.status}`);
  const commits = (await res.json()) as Array<{
    html_url: string;
    commit: { message: string; committer: { date: string } };
  }>;
  return commits.map((c) => ({
    repo,
    date: c.commit.committer.date,
    message: c.commit.message.split('\n')[0] ?? '',
    url: c.html_url,
  }));
}

/**
 * Recent commits on the featured repositories. Reads the live API at build time and falls
 * back to the committed snapshot, so the build never fails because GitHub was unreachable.
 */
export async function getActivity(): Promise<Activity> {
  const token = process.env.GITHUB_TOKEN;
  // Dev reloads would burn the unauthenticated rate limit (60 requests an hour), so
  // outside production builds the snapshot is used unless a token is provided.
  if (!import.meta.env.PROD && !token) return fromSnapshot();
  try {
    const lists = await Promise.all(site.activityRepos.map((r) => fetchRepo(r, token)));
    const items = lists
      .flat()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, LIMIT);
    return { items, source: 'live', asOf: new Date().toISOString() };
  } catch (error) {
    console.warn(`[activity] live fetch failed, using snapshot: ${String(error)}`);
    return fromSnapshot();
  }
}

function fromSnapshot(): Activity {
  return {
    items: (snapshot.items as ActivityItem[]).slice(0, LIMIT),
    source: 'snapshot',
    asOf: snapshot.fetchedAt,
  };
}
