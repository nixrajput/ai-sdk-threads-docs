const REPO = "nixrajput/ai-sdk-threads";
const FIRST_PUBLISH = "2026-08-06";

// Short window, not version.ts's hourly one: GitHub's unauthenticated API caps at 60
// requests/hour/IP, so every fetch here must be cached, but visitors still want numbers
// that move within a session rather than numbers frozen at build time.
const REVALIDATE_SECONDS = 600;

export interface Contributor {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  contributions: number;
}

export interface ProjectStats {
  suiteTests?: number;
  totalDownloads?: number;
  stars?: number;
  forks?: number;
  contributors?: Contributor[];
}

// The route is server-rendered, so a hung upstream would hold the response open rather than
// merely lose a number. A missed deadline degrades to an omitted stat like any other failure.
const REQUEST_TIMEOUT_MS = 4000;

/**
 * The suite size, read from the package README's claim row rather than copied here. That row is
 * the single home for the project's counts and ships with every release, so this cannot drift;
 * a hardcoded copy went stale three times in one afternoon.
 */
async function fetchSuiteTests(): Promise<number | undefined> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO}/main/README.md`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return undefined;
    const match = /<strong>(\d+) tests<\/strong>/.exec(await res.text());
    return match ? Number(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

async function fetchJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    return res.ok ? await res.json() : undefined;
  } catch {
    return undefined;
  }
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

/**
 * npm's /downloads/range answers at most 18 months per query and silently drops anything
 * older, so a single first-publish-to-today range would quietly stop being all-time in
 * February 2028. Windows of 540 days stay inside that cap: one request until then, two after.
 */
function downloadWindows(from: string, to: string): [string, string][] {
  const WINDOW_DAYS = 540;
  const end = new Date(`${to}T00:00:00Z`);
  const windows: [string, string][] = [];
  for (let start = new Date(`${from}T00:00:00Z`); start <= end;) {
    const stop = new Date(start);
    stop.setUTCDate(stop.getUTCDate() + WINDOW_DAYS - 1);
    const last = stop < end ? stop : end;
    windows.push([iso(start), iso(last)]);
    start = new Date(last);
    start.setUTCDate(start.getUTCDate() + 1);
  }
  return windows;
}

/**
 * All the live project stats the home page shows, in one call. Each source can fail
 * independently (rate limit, network) - on failure that stat is omitted rather than
 * rendered as a zero, which would read as "this project has no downloads" when the
 * truth is just "npm didn't answer".
 */
export async function getProjectStats(): Promise<ProjectStats> {
  const windows = downloadWindows(FIRST_PUBLISH, iso(new Date()));
  const [downloads, repo, contributors, suiteTests] = await Promise.all([
    Promise.all(
      windows.map(([from, to]) =>
        fetchJson(`https://api.npmjs.org/downloads/range/${from}:${to}/ai-sdk-threads`),
      ),
    ),
    fetchJson(`https://api.github.com/repos/${REPO}`),
    fetchJson(`https://api.github.com/repos/${REPO}/contributors`),
    fetchSuiteTests(),
  ]);

  const stats: ProjectStats = {};
  if (suiteTests !== undefined) stats.suiteTests = suiteTests;

  // Every window has to answer: a partial sum under an all-time label undercounts, which is
  // the same lie as a zero.
  let total = 0;
  let complete = true;
  for (const window of downloads) {
    const days = (window as { downloads?: { downloads: number }[] } | undefined)?.downloads;
    if (!Array.isArray(days)) {
      complete = false;
      break;
    }
    for (const day of days) total += day.downloads ?? 0;
  }
  if (complete) stats.totalDownloads = total;

  const repoData = repo as { stargazers_count?: unknown; forks_count?: unknown } | undefined;
  if (typeof repoData?.stargazers_count === "number") stats.stars = repoData.stargazers_count;
  if (typeof repoData?.forks_count === "number") stats.forks = repoData.forks_count;

  if (Array.isArray(contributors)) {
    stats.contributors = (
      contributors as {
        login?: unknown;
        avatar_url?: unknown;
        html_url?: unknown;
        contributions?: unknown;
      }[]
    )
      .filter((c) => typeof c.login === "string" && !c.login.endsWith("[bot]"))
      .map((c) => ({
        login: c.login as string,
        avatarUrl: c.avatar_url as string,
        htmlUrl: c.html_url as string,
        contributions: c.contributions as number,
      }));
  }

  return stats;
}
