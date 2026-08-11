"use client";

import { useState } from "react";
import { INSTALL_CMD } from "@/lib/shared";

// State drives the icon, and the same state drives a live region: an icon swap alone announces
// nothing, and this control's whole job is confirming something invisible happened.
type Status = "idle" | "copied" | "failed";

const LABEL: Record<Status, string> = {
  idle: "Copy install command",
  copied: "Copied to clipboard",
  failed: "Copy failed - select the command and copy it yourself",
};

export function InstallCommand() {
  const [status, setStatus] = useState<Status>("idle");

  return (
    <div className="card flex items-center gap-3 py-2 pr-2 pl-4 font-mono text-sm">
      <span className="text-fd-muted-foreground select-none">$</span>
      <span>{INSTALL_CMD}</span>
      <button
        type="button"
        aria-label={LABEL[status]}
        // Only report success if the write resolved: clipboard access fails on an insecure context
        // or a denied permission, and a lying "copied" is worse than no feedback.
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(INSTALL_CMD);
            setStatus("copied");
          } catch {
            setStatus("failed");
          }
          setTimeout(() => setStatus("idle"), 1800);
        }}
        className="text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground rounded-md p-2 transition-colors"
      >
        {status === "copied" ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4 text-(--pass)"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Copied</title>
            <path d="m20 6-11 11-5-5" />
          </svg>
        ) : status === "failed" ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4 text-(--stale)"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Copy failed</title>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <title>Copy</title>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h8" />
          </svg>
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {status === "idle" ? "" : LABEL[status]}
      </span>
    </div>
  );
}
