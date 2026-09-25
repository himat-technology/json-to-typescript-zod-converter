import { parseJson, validateRootName } from "@/lib/parser/json-parser";
import { inferTypes } from "@/lib/parser/type-inference";
import { computeStatistics } from "@/lib/parser/statistics";
import { generateOutput } from "@/lib/utils/formatting";
import type {
  ConverterOptions,
  GeneratedResult,
  InferenceResult,
  Statistics,
} from "@/types/converter";

export interface ConvertState {
  inference: InferenceResult | null;
  generated: GeneratedResult | null;
  statistics: Statistics;
  parseError: string | null;
  rootNameError: string | null;
  isValidJson: boolean;
}

const EMPTY_STATS: Statistics = {
  totalProperties: 0,
  nestingDepth: 0,
  generatedLines: 0,
  outputBytes: 0,
  outputSize: "0 B",
};

export function convertJson(
  jsonText: string,
  options: ConverterOptions,
): ConvertState {
  const rootNameError = validateRootName(options.rootName);
  const parsed = parseJson(jsonText);

  if (!parsed.success) {
    return {
      inference: null,
      generated: null,
      statistics: EMPTY_STATS,
      parseError: parsed.error,
      rootNameError,
      isValidJson: false,
    };
  }

  // JSON is valid even when the root name is not — keep statuses separate.
  if (rootNameError) {
    return {
      inference: null,
      generated: null,
      statistics: EMPTY_STATS,
      parseError: null,
      rootNameError,
      isValidJson: true,
    };
  }

  try {
    const inference = inferTypes(parsed.data, {
      rootName: options.rootName.trim(),
      optionalFields: options.optionalFields,
      readonlyProperties: options.readonlyProperties,
      smartStringDetection: options.smartStringDetection,
    });

    const generated = generateOutput(inference, {
      ...options,
      rootName: options.rootName.trim(),
    });

    const statistics = computeStatistics(inference, generated.active);

    return {
      inference,
      generated,
      statistics,
      parseError: null,
      rootNameError: null,
      isValidJson: true,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected conversion error.";
    return {
      inference: null,
      generated: null,
      statistics: EMPTY_STATS,
      parseError: message,
      rootNameError: null,
      isValidJson: true,
    };
  }
}
