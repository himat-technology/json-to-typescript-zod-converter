"use client";

import type { ConverterOptions, OutputFormat } from "@/types/converter";

interface ConverterConfigProps {
  options: ConverterOptions;
  rootNameError: string | null;
  onChange: (patch: Partial<ConverterOptions>) => void;
}

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "interface", label: "TypeScript Interface" },
  { value: "type", label: "TypeScript Type Alias" },
  { value: "zod", label: "Zod Schema" },
  { value: "both", label: "TypeScript + Zod" },
];

export function ConverterConfig({
  options,
  rootNameError,
  onChange,
}: ConverterConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="root-name" className="label">
          Root Type / Interface Name
        </label>
        <input
          id="root-name"
          className="input font-mono"
          value={options.rootName}
          onChange={(e) => onChange({ rootName: e.target.value })}
          placeholder="UserProfile"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(rootNameError)}
          aria-describedby={rootNameError ? "root-name-error" : "root-name-help"}
        />
        {rootNameError ? (
          <p id="root-name-error" className="helper text-error" role="alert">
            {rootNameError}
          </p>
        ) : (
          <p id="root-name-help" className="helper">
            Valid TypeScript identifier, e.g. UserProfile, ApiResponse, Product
          </p>
        )}
      </div>

      <div>
        <label htmlFor="output-format" className="label">
          Output Format
        </label>
        <select
          id="output-format"
          className="select"
          value={options.outputFormat}
          onChange={(e) =>
            onChange({ outputFormat: e.target.value as OutputFormat })
          }
        >
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label mb-2">Formatting Options</legend>
        <div className="space-y-2">
          <ToggleRow
            id="optional-fields"
            label="Mark Fields Optional (?)"
            description="username?: string"
            checked={options.optionalFields}
            onChange={(checked) => onChange({ optionalFields: checked })}
          />
          <ToggleRow
            id="readonly-props"
            label="Readonly Properties"
            description="readonly username: string"
            checked={options.readonlyProperties}
            onChange={(checked) => onChange({ readonlyProperties: checked })}
          />
          <ToggleRow
            id="smart-strings"
            label="Smart String Detection"
            description="Detect email, URL, and ISO datetime for Zod"
            checked={options.smartStringDetection}
            onChange={(checked) => onChange({ smartStringDetection: checked })}
          />
        </div>
      </fieldset>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-muted-bg/50 px-3 py-2.5">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-muted font-mono truncate">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="toggle"
        data-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}
