import pkg from "../package.json" with { type: "json" };
import { appName } from "./shared";

/**
 * The published version, read from npm rather than hardcoded so the site cannot claim a
 * release that does not exist. Revalidates hourly; on a registry failure it falls back to
 * the version these docs are actually typechecked against, which is a truthful floor
 * rather than a guess - and better than rendering nothing, which was the first attempt.
 */
export async function latestVersion(): Promise<string> {
  const installed = pkg.devDependencies[appName].replace(/^[^0-9]*/, "");

  try {
    const res = await fetch(`https://registry.npmjs.org/${appName}/latest`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return installed;
    const data: unknown = await res.json();
    const version = (data as { version?: unknown }).version;
    return typeof version === "string" ? version : installed;
  } catch {
    return installed;
  }
}
