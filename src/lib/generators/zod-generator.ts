import type {
  ConverterOptions,
  InferenceResult,
  InferredType,
  ObjectProperty,
  ObjectType,
} from "@/types/converter";
import { collectReachableDeclarations } from "@/lib/parser/type-inference";
import { formatPropertyKey, toSchemaConstName } from "@/lib/parser/type-naming";

export function generateZod(
  inference: InferenceResult,
  options: Pick<ConverterOptions, "rootName" | "smartStringDetection">,
): string {
  const schemaName = toSchemaConstName(options.rootName);
  const declarations = collectReachableDeclarations(
    inference.root,
    inference.declarations,
  );

  const lines: string[] = [
    "// ==========================================",
    "// Zod Runtime Validation Schema",
    "// ==========================================",
    "",
    'import { z } from "zod";',
    "",
  ];

  // For nested named objects referenced by name in TypeScript mode we inline
  // in Zod for a single self-contained schema (matches the HiMat-style output).
  if (inference.root.kind === "object") {
    lines.push(
      `export const ${schemaName} = ${renderZodType(inference.root, 0)};`,
    );
  } else {
    lines.push(
      `export const ${schemaName} = ${renderZodType(inference.root, 0)};`,
    );
  }

  lines.push("");
  lines.push(
    `export type ${options.rootName} = z.infer<typeof ${schemaName}>;`,
  );
  lines.push("");

  void declarations;

  return lines.join("\n");
}

function renderZodType(type: InferredType, indent: number): string {
  switch (type.kind) {
    case "primitive":
      return renderPrimitiveZod(type.value, type.stringFormat);
    case "null":
      return "z.null()";
    case "unknown":
      return "z.unknown()";
    case "array":
      return `z.array(${renderZodType(type.element, indent)})`;
    case "union":
      return renderUnionZod(type.types, indent);
    case "object":
      return renderObjectZod(type, indent);
    default:
      return "z.unknown()";
  }
}

function renderPrimitiveZod(
  value: "string" | "number" | "boolean",
  format?: "email" | "url" | "datetime",
): string {
  if (value === "number") return "z.number()";
  if (value === "boolean") return "z.boolean()";
  if (format === "email") return "z.string().email()";
  if (format === "url") return "z.string().url()";
  if (format === "datetime") return "z.string().datetime()";
  return "z.string()";
}

function renderUnionZod(types: InferredType[], indent: number): string {
  // Special-case: T | null → z.xxx().nullable()
  const nonNull = types.filter((t) => t.kind !== "null");
  const hasNull = nonNull.length < types.length;

  if (hasNull && nonNull.length === 1) {
    return `${renderZodType(nonNull[0], indent)}.nullable()`;
  }

  if (hasNull && nonNull.length > 1) {
    const inner = `z.union([${nonNull.map((t) => renderZodType(t, indent)).join(", ")}])`;
    return `${inner}.nullable()`;
  }

  if (types.length === 1) {
    return renderZodType(types[0], indent);
  }

  return `z.union([${types.map((t) => renderZodType(t, indent)).join(", ")}])`;
}

function renderObjectZod(obj: ObjectType, indent: number): string {
  const pad = "  ".repeat(indent);
  const innerPad = "  ".repeat(indent + 1);

  if (obj.properties.length === 0) {
    return "z.object({})";
  }

  const props = obj.properties.map((prop) => {
    const key = formatPropertyKey(prop.key);
    const schema = renderPropertyZod(prop, indent + 1);
    return `${innerPad}${key}: ${schema},`;
  });

  return [`z.object({`, ...props, `${pad}})`].join("\n");
}

function renderPropertyZod(prop: ObjectProperty, indent: number): string {
  let schema = renderZodType(prop.type, indent);

  // null-only property
  if (prop.type.kind === "null") {
    schema = "z.null()";
  }

  // If type is already a union with null, nullable is handled in renderUnionZod
  if (prop.optional) {
    schema = `${schema}.optional()`;
  }

  // Readonly has no Zod equivalent for runtime; TypeScript side handles it.
  return schema;
}

/**
 * Generate combined TypeScript + Zod output.
 */
export function generateCombined(
  typescript: string,
  zod: string,
): string {
  return [
    "// ==========================================",
    "// 1. TypeScript Definition",
    "// ==========================================",
    "",
    stripHeader(typescript),
    "",
    "// ==========================================",
    "// 2. Zod Runtime Validation",
    "// ==========================================",
    "",
    stripHeader(zod),
    "",
  ].join("\n");
}

function stripHeader(code: string): string {
  return code
    .replace(/^\/\/ =+\n\/\/ .+\n\/\/ =+\n*/m, "")
    .trim();
}
