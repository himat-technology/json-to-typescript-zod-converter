"use client";

import { ShieldCheck } from "lucide-react";

export function PrivacyBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-card-border bg-success-bg px-2.5 py-1 text-success ${
        compact ? "text-xs" : "text-sm"
      }`}
      role="status"
      aria-label="100% browser-local. Your JSON never leaves your browser."
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-semibold">100% Browser-Local</span>
      {!compact && (
        <span className="hidden text-success/80 sm:inline">
          · Your JSON never leaves your browser
        </span>
      )}
    </div>
  );
}
