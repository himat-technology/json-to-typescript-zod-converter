/**
 * Deterministic TypeScript-safe naming for nested object types.
 */

export function toPascalCaseSegment(raw: string): string {
  const cleaned = raw
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  if (!cleaned) {
    return "Item";
  }

  // Ensure it doesn't start with a digit
  if (/^[0-9]/.test(cleaned)) {
    return `N${cleaned}`;
  }

  return cleaned;
}

export function buildNestedTypeName(parentName: string, key: string): string {
  const segment = toPascalCaseSegment(key);
  return `${parentName}_${segment}`;
}

export function buildArrayElementTypeName(parentName: string, key: string): string {
  const segment = toPascalCaseSegment(key);
  return `${parentName}_${segment}Item`;
}

/**
 * Returns a property key expression safe for TypeScript object types.
 * Quotes keys that are not valid identifiers.
 */
export function formatPropertyKey(key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}

/**
 * Convert a type name to a camelCase Zod schema const name.
 * UserProfile → userProfileSchema
 */
export function toSchemaConstName(typeName: string): string {
  const camel =
    typeName.charAt(0).toLowerCase() + typeName.slice(1);
  return `${camel}Schema`;
}

/**
 * Ensure unique declaration names when collisions occur.
 */
export function uniquifyName(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}_${i}`)) {
    i += 1;
  }
  const unique = `${base}_${i}`;
  used.add(unique);
  return unique;
}
