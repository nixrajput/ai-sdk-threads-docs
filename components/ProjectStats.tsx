import { getProjectStats } from "@/lib/stats";

export async function ProjectStats() {
  const stats = await getProjectStats();

  // Every live cell is gated on a nonzero value, not merely a present one: a "0" in display
  // type is dead weight, and each cell appears on its own once its number means something.
  // The order is shared with the sibling docs site, with slot three carrying whichever fact
  // belongs to this package.
  const cells: { label: string; value: string }[] = [];
  if (stats.monthlyDownloads) {
    cells.push({ label: "downloads a month", value: stats.monthlyDownloads.toLocaleString() });
  }
  if (stats.gzipBytes) {
    // 1024-based to two decimals, exactly as `npm run report` prints it.
    cells.push({
      label: "minified + gzipped",
      value: `${(stats.gzipBytes / 1024).toFixed(2)} kB`,
    });
  }
  if (stats.unpackedBytes) {
    cells.push({
      label: "unpacked size",
      value: `${Math.round(stats.unpackedBytes / 1024).toLocaleString()} kB`,
    });
  }
  if (stats.stars) {
    cells.push({
      label: stats.stars === 1 ? "GitHub star" : "GitHub stars",
      value: String(stats.stars),
    });
  }
  if (stats.forks) {
    cells.push({ label: stats.forks === 1 ? "fork" : "forks", value: String(stats.forks) });
  }

  const contributors = stats.contributors ?? [];

  return (
    <section id="project" className="w-full px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-(--content-width)">
        <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
          The project
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">By the numbers</h2>
        {/* auto-fit, not a fixed column count: the cells are gated on live values, so the count
            varies. It collapses empty tracks so few cards still fill the row, and unlike flex-1
            a lone card wrapping onto a second row keeps its track width instead of stretching. */}
        <dl className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
          {cells.map((cell) => (
            <div key={cell.label} className="card flex flex-col gap-1 p-5">
              <dt className="font-display text-3xl font-bold tracking-tight">{cell.value}</dt>
              <dd className="text-fd-muted-foreground text-sm">{cell.label}</dd>
            </div>
          ))}
        </dl>

        {/* w-fit so the card hugs its contributors rather than stranding one avatar in the middle
            of a full-width panel; max-w-full lets a longer list wrap instead of overflowing. */}
        {contributors.length > 0 && (
          <div className="card mx-auto mt-4 flex w-fit max-w-full flex-col items-center gap-6 p-8 text-center">
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-(--muted) uppercase">
              {contributors.length === 1 ? "Contributor" : `${contributors.length} contributors`}
            </p>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-6">
              {contributors.map((c) => (
                <li key={c.login}>
                  <a
                    href={c.htmlUrl}
                    className="group flex w-20 flex-col items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--live)"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar host is not allowlisted in next.config, and this page carries no CSP */}
                    <img
                      src={c.avatarUrl}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="size-14 rounded-full ring-1 ring-(--line) transition-transform group-hover:scale-105"
                    />
                    <span className="max-w-full truncate text-sm font-medium group-hover:text-(--live)">
                      {c.login}
                    </span>
                    <span className="text-fd-muted-foreground font-mono text-xs">
                      {c.contributions.toLocaleString()}{" "}
                      {c.contributions === 1 ? "commit" : "commits"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
