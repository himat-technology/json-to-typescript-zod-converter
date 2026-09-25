"use client";

import {
  Moon,
  Sun,
  ExternalLink,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { PrivacyBadge } from "./privacy-badge";
import { useCallback, useSyncExternalStore } from "react";
import { HIMAT } from "@/lib/himat";

type Theme = "light" | "dark";

const themeListeners = new Set<() => void>();

function emitThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function writeTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  root.classList.toggle("light", next === "light");
  window.localStorage.setItem("theme", next);
  emitThemeChange();
}

function subscribe(listener: () => void) {
  themeListeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (!window.localStorage.getItem("theme")) {
      emitThemeChange();
      writeTheme(readTheme());
    }
  };
  media.addEventListener("change", onMedia);
  writeTheme(readTheme());
  return () => {
    themeListeners.delete(listener);
    media.removeEventListener("change", onMedia);
  };
}

export function Header() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);

  const toggleTheme = useCallback(() => {
    writeTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="brand-mark mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            aria-hidden="true"
          >
            HM
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <a
                href={HIMAT.website}
                className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text"
                style={{ backgroundImage: "var(--gradient-brand)" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {HIMAT.name}
              </a>
              <span className="hidden text-muted sm:inline" aria-hidden="true">
                ·
              </span>
              <a
                href={HIMAT.demo}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
              JSON to TypeScript &amp; Zod Converter
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Convert JSON payloads into production-ready TypeScript types and
              Zod validation schemas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PrivacyBadge compact />
          <a
            href={HIMAT.website}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit himat.co.in"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{HIMAT.websiteLabel}</span>
          </a>
          <a
            href={`mailto:${HIMAT.email}`}
            className="btn btn-ghost"
            aria-label={`Email ${HIMAT.email}`}
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={`tel:${HIMAT.phoneTel}`}
            className="btn btn-ghost"
            aria-label={`Call ${HIMAT.phone}`}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-accent-3" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
