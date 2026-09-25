"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { ConverterConfig } from "@/components/converter-config";
import { PresetButtons } from "@/components/preset-buttons";
import { JsonInput } from "@/components/json-input";
import { GeneratedOutput } from "@/components/generated-output";
import { PayloadValidator } from "@/components/payload-validator";
import { StatisticsPanel } from "@/components/statistics";
import { PrivacyBadge } from "@/components/privacy-badge";
import { convertJson } from "@/lib/convert";
import { DEFAULT_JSON, PRESETS } from "@/lib/presets";
import { formatJson, repairJson } from "@/lib/parser/json-repair";
import { HIMAT } from "@/lib/himat";
import type {
  ConverterOptions,
  Preset,
  PresetId,
} from "@/types/converter";

const DEFAULT_OPTIONS: ConverterOptions = {
  rootName: "UserProfile",
  outputFormat: "both",
  optionalFields: false,
  readonlyProperties: false,
  smartStringDetection: true,
};

export function ConverterApp() {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [options, setOptions] = useState<ConverterOptions>(DEFAULT_OPTIONS);
  const [activePreset, setActivePreset] = useState<PresetId | null>("user-profile");
  const [repairMessage, setRepairMessage] = useState<string | null>(null);
  const [debouncedJson, setDebouncedJson] = useState(DEFAULT_JSON);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handle = window.setTimeout(() => {
      startTransition(() => setDebouncedJson(jsonText));
    }, 180);
    return () => window.clearTimeout(handle);
  }, [jsonText]);

  const state = useMemo(
    () => convertJson(debouncedJson, options),
    [debouncedJson, options],
  );

  function patchOptions(patch: Partial<ConverterOptions>) {
    setOptions((prev) => ({ ...prev, ...patch }));
    setActivePreset(null);
  }

  function handlePreset(preset: Preset) {
    setJsonText(preset.json);
    setDebouncedJson(preset.json);
    setOptions((prev) => ({ ...prev, rootName: preset.rootName }));
    setActivePreset(preset.id);
    setRepairMessage(null);
  }

  function handleClear() {
    setJsonText("");
    setDebouncedJson("");
    setRepairMessage(null);
    setActivePreset(null);
  }

  function handleFormat() {
    const result = formatJson(jsonText);
    if (result.success) {
      setJsonText(result.repaired);
      setDebouncedJson(result.repaired);
      setRepairMessage(result.message);
      setActivePreset(null);
    } else {
      setRepairMessage(result.message);
    }
  }

  function handleRepair() {
    const result = repairJson(jsonText);
    setRepairMessage(result.message);
    if (result.success) {
      setJsonText(result.repaired);
      setDebouncedJson(result.repaired);
      setActivePreset(null);
    }
  }

  const disabledReason =
    state.rootNameError ??
    state.parseError ??
    (!state.generated ? "Enter valid JSON to generate output." : null);

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="privacy-banner mb-6 flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <PrivacyBadge />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/85">
            <span>No server APIs · Offline-ready</span>
            <a
              href={HIMAT.demo}
              className="font-semibold text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo on himat.tech
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="card space-y-5 p-4 sm:p-5">
            <ConverterConfig
              options={options}
              rootNameError={state.rootNameError}
              onChange={patchOptions}
            />

            <PresetButtons activeId={activePreset} onSelect={handlePreset} />

            <JsonInput
              value={jsonText}
              isValid={state.isValidJson}
              parseError={state.parseError}
              onChange={(value) => {
                setJsonText(value);
                setActivePreset(null);
                setRepairMessage(null);
              }}
              onFormat={handleFormat}
              onRepair={handleRepair}
              onClear={handleClear}
              repairMessage={repairMessage}
            />

            <StatisticsPanel stats={state.statistics} />
          </section>

          <GeneratedOutput
            generated={state.generated}
            outputFormat={options.outputFormat}
            rootName={options.rootName}
            disabledReason={disabledReason}
          />
        </div>

        <div className="mt-6">
          <PayloadValidator
            inference={state.inference}
            sampleJson={state.isValidJson ? debouncedJson : PRESETS[0].json}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
