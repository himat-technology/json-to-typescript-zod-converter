import { parseJson } from "@/lib/parser/json-parser";
import { buildZodSchema, validatePayload } from "./schema-builder";
import type { InferenceResult, ValidationResult } from "@/types/converter";

export function validateCandidatePayload(
  inference: InferenceResult | null,
  candidateJson: string,
): ValidationResult {
  if (!inference) {
    return {
      success: false,
      issues: [],
      summary: "Generate a schema first by providing valid source JSON.",
    };
  }

  const parsed = parseJson(candidateJson);
  if (!parsed.success) {
    return {
      success: false,
      issues: [{ path: "(root)", message: parsed.error }],
      summary: "✕ Payload validation failed",
    };
  }

  const schema = buildZodSchema(inference);
  return validatePayload(schema, parsed.data);
}
