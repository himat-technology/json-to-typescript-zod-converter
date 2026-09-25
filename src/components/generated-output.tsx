"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Copy, Download } from "lucide-react";
import type { GeneratedResult, OutputFormat } from "@/types/converter";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { downloadTextFile } from "@/lib/utils/download";

interface GeneratedOutputProps {
  generated: GeneratedResult | null;
  outputFormat: OutputFormat;
  rootName: string;
  disabledReason?: string | null;
}

type TabId = "typescript" | "zod" | "combined";

export function GeneratedOutput({
  generated,
  outputFormat,
  rootName,
  disabledReason,
}: GeneratedOutputProps) {
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("combined");

  const availableTabs = useMemo(() => {
    if (outputFormat === "both") {
      return [
        { id: "combined" as const, label: "Combined" },
        { id: "typescript" as const, label: "TypeScript" },
        { id: "zod" as const, label: "Zod" },
      ];
    }
    if (outputFormat === "zod") {
      return [{ id: "zod" as const, label: "Zod" }];
    }
    return [{ id: "typescript" as const, label: "TypeScript" }];
  }, [outputFormat]);

  const activeTab =
    availableTabs.find((t) => t.id === tab)?.id ?? availableTabs[0].id;

  const code = useMemo(() => {
    if (!generated) return "";
    if (activeTab === "typescript") return generated.typescript;
    if (activeTab === "zod") return generated.zod;
    return generated.combined || generated.active;
  }, [generated, activeTab]);

  async function handleCopy() {
    if (!code) return;
    const result = await copyToClipboard(code);
    if (!result.success) {
      setActionError(result.error ?? "Copy failed");
      return;
    }
    setActionError(null);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function handleDownload() {
    if (!code) return;
    const safeName = rootName.trim() || "Generated";
    const result = downloadTextFile(`${safeName}.ts`, code);
    if (!result.success) {
      setActionError(result.error ?? "Download failed");
    } else {
      setActionError(null);
    }
  }

  return (
    <section className="card flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-base font-semibold">
            Generated TypeScript &amp; Zod Code
          </h2>
          <p className="text-xs text-muted">
            Dynamically inferred from your JSON — browser-local only
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!code}
            aria-live="polite"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy
              </>
            )}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={!code}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download .ts
          </button>
        </div>
      </div>

      {availableTabs.length > 1 && (
        <div
          className="flex gap-1 border-b border-card-border px-4 pt-2 sm:px-5"
          role="tablist"
          aria-label="Output views"
        >
          {availableTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              className={`rounded-t-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === t.id
                  ? "bg-muted-bg text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 p-3 sm:p-4">
        {disabledReason || !code ? (
          <div
            className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-card-border bg-muted-bg/40 px-6 text-center text-sm text-muted"
            role="status"
          >
            {disabledReason ?? "Enter valid JSON to generate TypeScript and Zod output."}
          </div>
        ) : (
          <pre
            className="code-block h-full min-h-[320px] max-h-[640px] overflow-auto p-4"
            tabIndex={0}
            aria-label="Generated code"
          >
            <code>{highlightTypeScript(code)}</code>
          </pre>
        )}
      </div>

      {actionError && (
        <p className="border-t border-card-border px-4 py-2 text-sm text-error" role="alert">
          {actionError}
        </p>
      )}
    </section>
  );
}

/** Lightweight syntax highlighting for TS/Zod output (no external highlighter). */
function highlightTypeScript(code: string): ReactNode {
  const parts = code.split(
    /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:export|interface|type|import|from|const|readonly|infer|typeof)\b|\b(?:string|number|boolean|null|unknown|true|false)\b|\bz(?:\.[A-Za-z]+(?:\([^)]*\))?)+|\b[A-Z][A-Za-z0-9_]*)/g,
  );

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("//")) {
      return (
        <span key={index} className="text-slate-500">
          {part}
        </span>
      );
    }
    if (part.startsWith('"') || part.startsWith("'")) {
      return (
        <span key={index} className="text-emerald-300">
          {part}
        </span>
      );
    }
    if (
      /^(export|interface|type|import|from|const|readonly|infer|typeof)$/.test(
        part,
      )
    ) {
      return (
        <span key={index} className="text-sky-300">
          {part}
        </span>
      );
    }
    if (/^(string|number|boolean|null|unknown|true|false)$/.test(part)) {
      return (
        <span key={index} className="text-amber-300">
          {part}
        </span>
      );
    }
    if (part.startsWith("z.")) {
      return (
        <span key={index} className="text-violet-300">
          {part}
        </span>
      );
    }
    if (/^[A-Z][A-Za-z0-9_]*$/.test(part)) {
      return (
        <span key={index} className="text-teal-300">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
