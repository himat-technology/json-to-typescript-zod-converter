import type {
  ConverterOptions,
  InferenceResult,
  InferredType,
  ObjectType,
  OutputFormat,
} from "@/types/converter";
import { collectReachableDeclarations } from "@/lib/parser/type-inference";
import { formatPropertyKey } from "@/lib/parser/type-naming";

export function generateTypeScript(
  inference: InferenceResult,
  options: Pick<ConverterOptions, "outputFormat" | "rootName">,
): string {
  const finalMode: "interface" | "type" =
    options.outputFormat === "type" ? "type" : "interface";

  const declarations = collectReachableDeclarations(
    inference.root,
    inference.declarations,
  );

  // Non-object roots (primitives, arrays at top level) — type alias + any
  // nested object declarations the array/union may reference.
  if (inference.root.kind !== "object") {
    const header = sectionComment("TypeScript Type Alias Definition");
    const nested = [...declarations]
      .reverse()
      .map((decl) => renderObjectDeclaration(decl.type, finalMode === "type" ? "type" : "interface"));
    const body = renderTypeReference(inference.root, finalMode);
    const alias = `export type ${options.rootName} = ${body};`;
    const parts = [header, ...nested, alias].filter(Boolean);
    return `${parts.join("\n\n")}\n`;
  }

  const header = sectionComment(
    finalMode === "interface"
      ? "TypeScript Interface Definition"
      : "TypeScript Type Alias Definition",
  );

  // Root first, then nested types (reverse dependency order)
  const ordered = [...declarations].reverse();

  const blocks = ordered.map((decl) =>
    renderObjectDeclaration(decl.type, finalMode),
  );

  return `${header}\n\n${blocks.join("\n\n")}\n`;
}

function sectionComment(title: string): string {
  return [
    "// ==========================================",
    `// ${title}`,
    "// ==========================================",
  ].join("\n");
}

function renderObjectDeclaration(
  obj: ObjectType,
  mode: "interface" | "type",
): string {
  const lines: string[] = [];

  if (mode === "interface") {
    lines.push(`export interface ${obj.name} {`);
  } else {
    lines.push(`export type ${obj.name} = {`);
  }

  for (const prop of obj.properties) {
    const key = formatPropertyKey(prop.key);
    const optional = prop.optional ? "?" : "";
    const readonly = prop.readonly ? "readonly " : "";
    const typeStr = renderTypeReference(prop.type, mode);
    lines.push(`  ${readonly}${key}${optional}: ${typeStr};`);
  }

  if (mode === "interface") {
    lines.push("}");
  } else {
    lines.push("};");
  }

  return lines.join("\n");
}

export function renderTypeReference(
  type: InferredType,
  mode: "interface" | "type" = "interface",
): string {
  switch (type.kind) {
    case "primitive":
      return type.value;
    case "null":
      return "null";
    case "unknown":
      return "unknown";
    case "object":
      return type.name;
    case "array":
      return `${wrapIfUnion(type.element, mode)}[]`;
    case "union":
      return type.types.map((t) => renderTypeReference(t, mode)).join(" | ");
    default:
      return "unknown";
  }
}

function wrapIfUnion(type: InferredType, mode: "interface" | "type"): string {
  const rendered = renderTypeReference(type, mode);
  if (type.kind === "union") {
    return `(${rendered})`;
  }
  return rendered;
}

export function shouldGenerateTypeScript(format: OutputFormat): boolean {
  return format === "interface" || format === "type" || format === "both";
}

export function shouldGenerateZod(format: OutputFormat): boolean {
  return format === "zod" || format === "both";
}
