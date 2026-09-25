import { z, type ZodTypeAny } from "zod";
import type {
  InferenceResult,
  InferredType,
  ObjectProperty,
  ValidationIssue,
  ValidationResult,
} from "@/types/converter";

/**
 * Build a runtime Zod schema from the inferred type tree.
 * Used by the interactive payload validator — never sent to a server.
 */
export function buildZodSchema(inference: InferenceResult): ZodTypeAny {
  return toZod(inference.root);
}

function toZod(type: InferredType): ZodTypeAny {
  switch (type.kind) {
    case "primitive":
      return primitiveZod(type.value, type.stringFormat);
    case "null":
      return z.null();
    case "unknown":
      return z.unknown();
    case "array":
      return z.array(toZod(type.element));
    case "union":
      return unionZod(type.types);
    case "object": {
      const shape: Record<string, ZodTypeAny> = {};
      for (const prop of type.properties) {
        shape[prop.key] = propertyZod(prop);
      }
      return z.object(shape);
    }
    default:
      return z.unknown();
  }
}

function primitiveZod(
  value: "string" | "number" | "boolean",
  format?: "email" | "url" | "datetime",
): ZodTypeAny {
  if (value === "number") return z.number();
  if (value === "boolean") return z.boolean();
  let schema = z.string();
  if (format === "email") schema = schema.email();
  if (format === "url") schema = schema.url();
  if (format === "datetime") schema = schema.datetime();
  return schema;
}

function unionZod(types: InferredType[]): ZodTypeAny {
  const nonNull = types.filter((t) => t.kind !== "null");
  const hasNull = nonNull.length < types.length;

  if (hasNull && nonNull.length === 1) {
    return toZod(nonNull[0]).nullable();
  }

  if (nonNull.length === 0) {
    return z.null();
  }

  if (nonNull.length === 1 && !hasNull) {
    return toZod(nonNull[0]);
  }

  const variants = nonNull.map(toZod) as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]];
  if (variants.length === 1) {
    return hasNull ? variants[0].nullable() : variants[0];
  }

  const union = z.union(variants);
  return hasNull ? union.nullable() : union;
}

function propertyZod(prop: ObjectProperty): ZodTypeAny {
  let schema = toZod(prop.type);
  if (prop.type.kind === "null") {
    schema = z.null();
  }
  if (prop.optional) {
    schema = schema.optional();
  }
  return schema;
}

export function validatePayload(
  schema: ZodTypeAny,
  data: unknown,
): ValidationResult {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      issues: [],
      summary: "✓ Payload matches the generated schema",
    };
  }

  const issues: ValidationIssue[] = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
    const expected = extractExpected(issue.message);
    const received = extractReceived(issue.message, issue);
    return {
      path,
      message: issue.message,
      expected,
      received,
    };
  });

  return {
    success: false,
    issues,
    summary: "✕ Payload validation failed",
  };
}

function extractExpected(message: string): string | undefined {
  const match = message.match(/expected\s+(.+?)(?:,|$)/i);
  return match?.[1]?.trim();
}

function extractReceived(
  message: string,
  issue: { code?: string; input?: unknown },
): string | undefined {
  const match = message.match(/received\s+(\S+)/i);
  if (match) return match[1];
  if (issue.input !== undefined) {
    return typeof issue.input;
  }
  return undefined;
}
