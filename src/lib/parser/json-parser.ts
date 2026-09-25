import type { ParseResult } from "@/types/converter";

const MAX_JSON_CHARS = 2_000_000;

export function parseJson(input: string): ParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, error: "JSON input is empty. Paste a JSON value to convert." };
  }

  if (trimmed.length > MAX_JSON_CHARS) {
    return {
      success: false,
      error: `JSON is too large (${trimmed.length.toLocaleString()} characters). Limit is ${MAX_JSON_CHARS.toLocaleString()} characters.`,
    };
  }

  try {
    const data: unknown = JSON.parse(trimmed);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? cleanJsonError(error.message)
        : "Unable to parse JSON.";
    return { success: false, error: message };
  }
}

function cleanJsonError(message: string): string {
  return message
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/^Unexpected token/i, "Unexpected token")
    .trim();
}

export function isValidTypeScriptIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

export function validateRootName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Root type name is required.";
  }
  if (!isValidTypeScriptIdentifier(trimmed)) {
    return "Root name must be a valid TypeScript identifier (letters, digits, _, $; cannot start with a digit).";
  }
  if (RESERVED_WORDS.has(trimmed)) {
    return `"${trimmed}" is a reserved TypeScript keyword. Choose another name.`;
  }
  return null;
}

const RESERVED_WORDS = new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "as",
  "implements",
  "interface",
  "let",
  "package",
  "private",
  "protected",
  "public",
  "static",
  "yield",
  "any",
  "boolean",
  "number",
  "string",
  "symbol",
  "type",
  "undefined",
  "unknown",
  "never",
  "object",
]);
