"use client";

import type { Preset, PresetId } from "@/types/converter";
import { PRESETS } from "@/lib/presets";
import { Bot, Package, UserRound } from "lucide-react";

const ICONS: Record<PresetId, typeof UserRound> = {
  "user-profile": UserRound,
  "ecommerce-order": Package,
  "ai-agent": Bot,
};

const PRESET_CLASS: Record<PresetId, string> = {
  "user-profile": "preset-0",
  "ecommerce-order": "preset-1",
  "ai-agent": "preset-2",
};

interface PresetButtonsProps {
  activeId: PresetId | null;
  onSelect: (preset: Preset) => void;
}

export function PresetButtons({ activeId, onSelect }: PresetButtonsProps) {
  return (
    <div>
      <p className="label">Quick Presets</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {PRESETS.map((preset) => {
          const Icon = ICONS[preset.id];
          const active = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`${PRESET_CLASS[preset.id]} rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "shadow-sm"
                  : "border-card-border bg-card"
              }`}
              style={
                active
                  ? {
                      borderColor: "var(--preset-accent)",
                      background:
                        "color-mix(in srgb, var(--preset-accent) 14%, transparent)",
                    }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "var(--preset-accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "";
                }
              }}
              aria-pressed={active}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                  style={{ background: "var(--preset-accent)" }}
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-semibold">{preset.label}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted leading-snug">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
