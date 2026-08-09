"use client";

import { useState } from "react";
import { INSTALL_CMD } from "@/lib/shared";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Copy install command: ${INSTALL_CMD}`}
      // Only report success if the write resolved: clipboard access fails on an
      // insecure context or a denied permission, and a lying "copied" is worse
      // than no feedback.
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(INSTALL_CMD);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setFailed(true);
          setTimeout(() => setFailed(false), 1500);
        }
      }}
      className="border-fd-border bg-fd-card flex items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--era-now)"
    >
      <span className="text-fd-muted-foreground">$</span>
      <span>{INSTALL_CMD}</span>
      <span aria-live="polite" className="text-fd-muted-foreground ml-2 text-xs">
        {failed ? "copy failed" : copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
