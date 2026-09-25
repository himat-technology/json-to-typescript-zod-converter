"use client";

import type { Statistics } from "@/types/converter";
import { BarChart3, Layers, FileCode2, HardDrive } from "lucide-react";

interface StatisticsPanelProps {
  stats: Statistics;
}

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  const items = [
    {
      label: "Total Properties",
      value: String(stats.totalProperties),
      icon: BarChart3,
      tone: "stat-card-0",
      iconColor: "text-primary",
    },
    {
      label: "Nesting Depth",
      value: String(stats.nestingDepth),
      icon: Layers,
      tone: "stat-card-1",
      iconColor: "text-accent",
    },
    {
      label: "Generated Lines",
      value: String(stats.generatedLines),
      icon: FileCode2,
      tone: "stat-card-2",
      iconColor: "text-accent-2",
    },
    {
      label: "Output Size",
      value: stats.outputSize,
      icon: HardDrive,
      tone: "stat-card-3",
      iconColor: "text-accent-3",
    },
  ];

  return (
    <div>
      <p className="label">Statistics</p>
      <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border border-card-border bg-card px-3 py-2.5 ${item.tone}`}
          >
            <dt className={`flex items-center gap-1.5 text-xs ${item.iconColor}`}>
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-muted">{item.label}</span>
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums tracking-tight text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
