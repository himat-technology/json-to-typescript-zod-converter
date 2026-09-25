"use client";

import { useState } from "react";
import { FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import type { InferenceResult, ValidationResult } from "@/types/converter";
import { validateCandidatePayload } from "@/lib/validation/payload-validator";

interface PayloadValidatorProps {
  inference: InferenceResult | null;
  sampleJson: string;
}

export function PayloadValidator({
  inference,
  sampleJson,
}: PayloadValidatorProps) {
  const [candidate, setCandidate] = useState(sampleJson);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState(false);
  const [trackedSample, setTrackedSample] = useState(sampleJson);
  const [trackedInference, setTrackedInference] = useState(inference);

  // Sync from source JSON until the user edits the tester (React-recommended
  // "adjust state when props change" pattern — no effect needed).
  if (!touched && sampleJson !== trackedSample) {
    setTrackedSample(sampleJson);
    setCandidate(sampleJson);
    setResult(null);
  } else if (sampleJson !== trackedSample) {
    setTrackedSample(sampleJson);
  }

  if (inference !== trackedInference) {
    setTrackedInference(inference);
    setResult(null);
  }

  function handleValidate() {
    const next = validateCandidatePayload(inference, candidate);
    setResult(next);
  }

  function handleUseSample() {
    setCandidate(sampleJson);
    setTrackedSample(sampleJson);
    setTouched(false);
    setResult(null);
  }

  return (
    <section className="card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">
              Interactive Payload Argument Tester
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted max-w-2xl">
            Paste a candidate JSON payload to verify whether it matches the
            generated schema. Validation runs entirely in your browser using
            Zod.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={handleUseSample}>
            Load Source JSON
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleValidate}
            disabled={!inference}
          >
            Validate Payload
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="payload-input" className="label">
          Candidate Payload
        </label>
        <textarea
          id="payload-input"
          className="textarea textarea-mono min-h-[200px] resize-y"
          value={candidate}
          onChange={(e) => {
            setCandidate(e.target.value);
            setTouched(true);
            setResult(null);
          }}
          spellCheck={false}
          aria-describedby="payload-result"
        />
      </div>

      <div id="payload-result" className="mt-4" aria-live="polite" role="status">
        {!inference && (
          <p className="text-sm text-muted">
            Provide valid source JSON above to build a schema before validating.
          </p>
        )}

        {result && (
          <div
            className={`rounded-xl border px-4 py-3 ${
              result.success
                ? "border-success/30 bg-success-bg text-success"
                : "border-error/30 bg-error-bg text-error"
            }`}
          >
            <p className="flex items-center gap-2 font-semibold">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4" aria-hidden="true" />
              )}
              {result.summary}
            </p>

            {!result.success && result.issues.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {result.issues.map((issue, idx) => (
                  <li
                    key={`${issue.path}-${idx}`}
                    className="rounded-lg border border-card-border bg-card px-3 py-2 font-mono text-xs sm:text-sm"
                  >
                    <div className="font-semibold text-foreground">{issue.path}</div>
                    <div className="text-muted">{issue.message}</div>
                    {(issue.expected || issue.received) && (
                      <div className="mt-1 text-muted">
                        {issue.expected && <span>Expected {issue.expected}</span>}
                        {issue.expected && issue.received && <span> · </span>}
                        {issue.received && <span>Received {issue.received}</span>}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
