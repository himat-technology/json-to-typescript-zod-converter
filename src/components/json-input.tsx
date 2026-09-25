"use client";

import { useMemo, useRef } from "react";
import { AlignLeft, Eraser, Wrench, CheckCircle2, XCircle } from "lucide-react";

interface JsonInputProps {
  value: string;
  isValid: boolean;
  parseError: string | null;
  onChange: (value: string) => void;
  onFormat: () => void;
  onRepair: () => void;
  onClear: () => void;
  repairMessage?: string | null;
}

export function JsonInput({
  value,
  isValid,
  parseError,
  onChange,
  onFormat,
  onRepair,
  onClear,
  repairMessage,
}: JsonInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = useMemo(
    () => Math.max(value.split(/\r?\n/).length, 1),
    [value],
  );
  const lines = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount],
  );

  function syncScroll() {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (textarea && gutter) {
      gutter.scrollTop = textarea.scrollTop;
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="json-input" className="label mb-0">
          JSON Input
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="btn btn-ghost" onClick={onFormat}>
            <AlignLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Format
          </button>
          <button type="button" className="btn btn-ghost" onClick={onRepair}>
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            Auto-Repair
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-card-border bg-card">
        <div className="relative flex h-[320px] max-h-[520px] min-h-[280px] resize-y overflow-hidden sm:h-[420px]">
          <div
            ref={gutterRef}
            className="select-none overflow-hidden border-r border-card-border bg-muted-bg px-2 py-3 text-right font-mono text-xs leading-[1.55] text-muted"
            aria-hidden="true"
            style={{ minWidth: "2.75rem" }}
          >
            {lines.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            id="json-input"
            className="textarea-mono h-full w-full flex-1 resize-none border-0 bg-transparent p-3 text-foreground focus:outline-none focus:ring-0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncScroll}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-describedby="json-status json-count"
            placeholder='{ "key": "value" }'
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-card-border bg-muted-bg/60 px-3 py-2 text-xs">
          <div id="json-status" role="status" aria-live="polite">
            {isValid ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Valid JSON
              </span>
            ) : (
              <span className="inline-flex items-start gap-1.5 font-medium text-error">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{parseError ?? "Invalid JSON"}</span>
              </span>
            )}
          </div>
          <span id="json-count" className="text-muted tabular-nums">
            {value.length.toLocaleString()} characters
          </span>
        </div>
      </div>

      {repairMessage && (
        <p className="helper" role="status">
          {repairMessage}
        </p>
      )}
    </div>
  );
}
