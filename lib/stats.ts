const REPO = "nixrajput/ai-sdk-threads";

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
  unpackedBytes?: number;
  monthlyDownloads?: number;
  stars?: number;
  forks?: number;
  contributors?: Contributor[];
}

// The route is server-rendered, so a hung upstream would hold the response open rather than
// merely lose a number. A missed deadline degrades to an omitted stat like any other failure.
const REQUEST_TIMEOUT_MS = 4000;

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

/**
 * All the live project stats the home page shows, in one call. Each source can fail
 * independently (rate limit, network) - on failure that stat is omitted rather than
 * rendered as a zero, which would read as "this project has no downloads" when the
 * truth is just "npm didn't answer".
 */
export async function getProjectStats(): Promise<ProjectStats> {
  const [downloads, registry, repo, contributors] = await Promise.all([
    // A rolling 30-day point query rather than a range from first publish: a rate stays
    // meaningful as the package ages, where a lifetime total only ever grows, and a point
    // query cannot run into the 18-month cap that silently truncates a long range. npm's
    // window closes a few days back - that lag is theirs, and the label says "a month".
    fetchJson("https://api.npmjs.org/downloads/point/last-month/ai-sdk-threads"),
    fetchJson("https://registry.npmjs.org/ai-sdk-threads/latest"),
    fetchJson(`https://api.github.com/repos/${REPO}`),
    // per_page=100, since the card prints this length as the contributor count and the
    // endpoint pages at 30 by default. One request covers any plausible size for this repo;
    // past 100 it would need real pagination, which is a happier problem than it sounds.
    fetchJson(`https://api.github.com/repos/${REPO}/contributors?per_page=100`),
  ]);

  const stats: ProjectStats = {};

  const monthly = (downloads as { downloads?: unknown } | undefined)?.downloads;
  if (typeof monthly === "number") stats.monthlyDownloads = monthly;

  // The published tarball unpacked, which is the entire install: the core declares no runtime
  // dependencies, so nothing else arrives alongside it.
  const unpacked = (registry as { dist?: { unpackedSize?: unknown } } | undefined)?.dist
    ?.unpackedSize;
  if (typeof unpacked === "number") stats.unpackedBytes = unpacked;

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
