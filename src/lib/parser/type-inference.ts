import type {
  ArrayType,
  ConverterOptions,
  InferenceResult,
  InferredType,
  NamedTypeDeclaration,
  ObjectProperty,
  ObjectType,
  PrimitiveType,
  StringFormat,
  UnionType,
} from "@/types/converter";
import {
  buildArrayElementTypeName,
  buildNestedTypeName,
  uniquifyName,
} from "./type-naming";

const MAX_DEPTH = 64;

export function inferTypes(
  data: unknown,
  options: Pick<
    ConverterOptions,
    "rootName" | "optionalFields" | "readonlyProperties" | "smartStringDetection"
  >,
): InferenceResult {
  const usedNames = new Set<string>();
  const declarations: NamedTypeDeclaration[] = [];

  // Array roots must not reuse the root name for element object types
  // (avoids invalid `export type Rows = Rows[]`).
  const suggestedName = Array.isArray(data)
    ? `${options.rootName}Item`
    : options.rootName;

  const root = inferValue(
    data,
    suggestedName,
    options,
    declarations,
    usedNames,
    0,
    !Array.isArray(data) && data !== null && typeof data === "object",
  );

  return { root, declarations };
}

function inferValue(
  value: unknown,
  suggestedName: string,
  options: Pick<
    ConverterOptions,
    "rootName" | "optionalFields" | "readonlyProperties" | "smartStringDetection"
  >,
  declarations: NamedTypeDeclaration[],
  usedNames: Set<string>,
  depth: number,
  isRoot: boolean,
): InferredType {
  if (depth > MAX_DEPTH) {
    return { kind: "unknown" };
  }

  if (value === null) {
    return { kind: "null" };
  }

  if (typeof value === "string") {
    return inferString(value, options.smartStringDetection);
  }

  if (typeof value === "number") {
    return { kind: "primitive", value: "number" };
  }

  if (typeof value === "boolean") {
    return { kind: "primitive", value: "boolean" };
  }

  if (Array.isArray(value)) {
    return inferArray(value, suggestedName, options, declarations, usedNames, depth);
  }

  if (typeof value === "object") {
    return inferObject(
      value as Record<string, unknown>,
      suggestedName,
      options,
      declarations,
      usedNames,
      depth,
      isRoot,
    );
  }

  return { kind: "unknown" };
}

function inferString(value: string, smart: boolean): PrimitiveType {
  const base: PrimitiveType = { kind: "primitive", value: "string" };
  if (!smart) return base;

  const format = detectStringFormat(value);
  if (format) {
    return { ...base, stringFormat: format };
  }
  return base;
}

export function detectStringFormat(value: string): StringFormat | undefined {
  if (!value || value.length > 2048) return undefined;

  // Email: conservative
  if (
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
      value,
    )
  ) {
    return "email";
  }

  // URL
  if (/^https?:\/\/[^\s]+$/i.test(value)) {
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return "url";
      }
    } catch {
      // ignore
    }
  }

  // ISO-8601 datetime (with timezone)
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    const date = Date.parse(value);
    if (!Number.isNaN(date)) {
      return "datetime";
    }
  }

  return undefined;
}

function inferObject(
  obj: Record<string, unknown>,
  suggestedName: string,
  options: Pick<
    ConverterOptions,
    "rootName" | "optionalFields" | "readonlyProperties" | "smartStringDetection"
  >,
  declarations: NamedTypeDeclaration[],
  usedNames: Set<string>,
  depth: number,
  isRoot: boolean,
): ObjectType {
  const name = uniquifyName(suggestedName, usedNames);

  const properties: ObjectProperty[] = Object.entries(obj).map(([key, val]) => {
    const childName =
      val !== null && typeof val === "object" && !Array.isArray(val)
        ? buildNestedTypeName(name, key)
        : Array.isArray(val)
          ? buildArrayElementTypeName(name, key)
          : buildNestedTypeName(name, key);

    const type = inferValue(val, childName, options, declarations, usedNames, depth + 1, false);

    return {
      key,
      type,
      optional: options.optionalFields,
      readonly: options.readonlyProperties,
    };
  });

  const objectType: ObjectType = {
    kind: "object",
    name,
    properties,
  };

  // Always collect named object declarations (including root)
  if (isRoot || properties.length >= 0) {
    declarations.push({ name, type: objectType });
  }

  return objectType;
}

function inferArray(
  arr: unknown[],
  suggestedName: string,
  options: Pick<
    ConverterOptions,
    "rootName" | "optionalFields" | "readonlyProperties" | "smartStringDetection"
  >,
  declarations: NamedTypeDeclaration[],
  usedNames: Set<string>,
  depth: number,
): ArrayType {
  if (arr.length === 0) {
    return { kind: "array", element: { kind: "unknown" } };
  }

  const elementTypes = arr.map((item) =>
    inferValue(item, suggestedName, options, declarations, usedNames, depth + 1, false),
  );

  const merged = mergeTypes(elementTypes, suggestedName, declarations, usedNames);
  return { kind: "array", element: merged };
}

/**
 * Merge multiple inferred types (e.g. array samples) into one.
 */
export function mergeTypes(
  types: InferredType[],
  suggestedName: string,
  declarations: NamedTypeDeclaration[],
  usedNames: Set<string>,
): InferredType {
  if (types.length === 0) return { kind: "unknown" };
  if (types.length === 1) return types[0];

  // If all are objects, merge properties
  if (types.every((t) => t.kind === "object")) {
    return mergeObjects(types as ObjectType[], suggestedName, declarations, usedNames);
  }

  // If all are arrays, merge element types
  if (types.every((t) => t.kind === "array")) {
    const elements = (types as ArrayType[]).map((t) => t.element);
    return {
      kind: "array",
      element: mergeTypes(elements, suggestedName, declarations, usedNames),
    };
  }

  // Deduplicate by structural signature, then union
  const unique = dedupeTypes(types);

  // Drop null from union and apply nullable later if needed —
  // keep null in the union for TypeScript | null
  if (unique.length === 1) return unique[0];

  // Prefer merging primitives of same kind with string formats
  const allPrimitiveSame =
    unique.every((t) => t.kind === "primitive") &&
    new Set((unique as PrimitiveType[]).map((t) => t.value)).size === 1;

  if (allPrimitiveSame) {
    const prims = unique as PrimitiveType[];
    const formats = new Set(
      prims.map((p) => p.stringFormat).filter((f): f is StringFormat => Boolean(f)),
    );
    const base = prims[0];
    if (formats.size === 1) {
      return { ...base, stringFormat: [...formats][0] };
    }
    // Conflicting formats — fall back to plain string
    return { kind: "primitive", value: base.value };
  }

  const union: UnionType = { kind: "union", types: unique };
  return flattenUnion(union);
}

function mergeObjects(
  objects: ObjectType[],
  suggestedName: string,
  declarations: NamedTypeDeclaration[],
  usedNames: Set<string>,
): ObjectType {
  // Use the first object's name if already registered; otherwise create one
  const name = objects[0]?.name || uniquifyName(suggestedName, usedNames);

  const keySet = new Set<string>();
  for (const obj of objects) {
    for (const prop of obj.properties) {
      keySet.add(prop.key);
    }
  }

  const properties: ObjectProperty[] = [];

  for (const key of keySet) {
    const presentIn = objects.filter((o) => o.properties.some((p) => p.key === key));
    const typesForKey = presentIn.map(
      (o) => o.properties.find((p) => p.key === key)!.type,
    );
    const optional =
      presentIn.length < objects.length ||
      presentIn.some((o) => o.properties.find((p) => p.key === key)!.optional);
    const readonly = presentIn.every(
      (o) => o.properties.find((p) => p.key === key)!.readonly,
    );

    const mergedType = mergeTypes(
      typesForKey,
      buildNestedTypeName(name, key),
      declarations,
      usedNames,
    );

    properties.push({ key, type: mergedType, optional, readonly });
  }

  const merged: ObjectType = { kind: "object", name, properties };

  // Remove prior declarations for objects that were merged into this one
  // and ensure the merged declaration exists
  const index = declarations.findIndex((d) => d.name === name);
  if (index >= 0) {
    declarations[index] = { name, type: merged };
  } else {
    declarations.push({ name, type: merged });
  }

  // When merging array-of-object samples, earlier per-item declarations may
  // have been created with uniquified names — leave them; generators emit
  // from the final declaration list filtered by reachability if needed.
  return merged;
}

function typeSignature(type: InferredType): string {
  switch (type.kind) {
    case "primitive":
      return `p:${type.value}:${type.stringFormat ?? ""}`;
    case "null":
      return "null";
    case "unknown":
      return "unknown";
    case "array":
      return `a:${typeSignature(type.element)}`;
    case "object":
      return `o:${type.name}`;
    case "union":
      return `u:${type.types.map(typeSignature).sort().join("|")}`;
    default:
      return "unknown";
  }
}

function dedupeTypes(types: InferredType[]): InferredType[] {
  const seen = new Map<string, InferredType>();
  for (const t of types) {
    const sig = typeSignature(t);
    if (!seen.has(sig)) {
      seen.set(sig, t);
    }
  }
  return [...seen.values()];
}

function flattenUnion(union: UnionType): InferredType {
  const flat: InferredType[] = [];
  for (const t of union.types) {
    if (t.kind === "union") {
      flat.push(...t.types);
    } else {
      flat.push(t);
    }
  }
  const unique = dedupeTypes(flat);
  if (unique.length === 1) return unique[0];
  return { kind: "union", types: unique };
}

/**
 * Collect reachable object declarations from a root type (in dependency order).
 */
export function collectReachableDeclarations(
  root: InferredType,
  all: NamedTypeDeclaration[],
): NamedTypeDeclaration[] {
  const byName = new Map(all.map((d) => [d.name, d]));
  const ordered: NamedTypeDeclaration[] = [];
  const visited = new Set<string>();

  function walk(type: InferredType): void {
    switch (type.kind) {
      case "object": {
        if (visited.has(type.name)) return;
        visited.add(type.name);
        for (const prop of type.properties) {
          walk(prop.type);
        }
        const decl = byName.get(type.name);
        if (decl) ordered.push(decl);
        break;
      }
      case "array":
        walk(type.element);
        break;
      case "union":
        for (const t of type.types) walk(t);
        break;
      default:
        break;
    }
  }

  walk(root);
  return ordered;
}
