import { appName } from "./shared";

// The package does not export ./package.json, so the installed version cannot be imported
// and the registry is the only honest source. Revalidated hourly; a failure returns null and
// the caller renders nothing rather than a stale or invented number.
export async function latestVersion(): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${appName}/latest`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const version = (data as { version?: unknown }).version;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}
