import type { ConverterOptions, GeneratedResult, InferenceResult } from "@/types/converter";
import { generateTypeScript, shouldGenerateTypeScript, shouldGenerateZod } from "@/lib/generators/typescript-generator";
import { generateCombined, generateZod } from "@/lib/generators/zod-generator";

export function generateOutput(
  inference: InferenceResult,
  options: ConverterOptions,
): GeneratedResult {
  const typescript = shouldGenerateTypeScript(options.outputFormat)
    ? generateTypeScript(inference, options)
    : "";

  const zod = shouldGenerateZod(options.outputFormat)
    ? generateZod(inference, options)
    : "";

  const combined =
    options.outputFormat === "both"
      ? generateCombined(typescript, zod)
      : options.outputFormat === "zod"
        ? zod
        : typescript;

  let active = combined;
  if (options.outputFormat === "interface" || options.outputFormat === "type") {
    active = typescript;
  } else if (options.outputFormat === "zod") {
    active = zod;
  }

  return { typescript, zod, combined, active };
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, waitMs);
  };
}
