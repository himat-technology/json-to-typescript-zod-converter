import type { RepairResult } from "@/types/converter";

/**
 * Best-effort browser-local JSON repair for common copy/paste mistakes.
 * Refuses ambiguous repairs and never silently invents structure.
 */
export function repairJson(input: string): RepairResult {
  const original = input.trim();
  if (!original) {
    return {
      success: false,
      repaired: input,
      message: "Nothing to repair — input is empty.",
    };
  }

  // Already valid?
  try {
    JSON.parse(original);
    return {
      success: true,
      repaired: JSON.stringify(JSON.parse(original), null, 2),
      message: "JSON was already valid. Formatted for readability.",
    };
  } catch {
    // continue
  }

  let candidate = original;

  // Strip BOM / zero-width chars
  candidate = candidate.replace(/^\uFEFF/, "").replace(/[\u200B-\u200D\uFEFF]/g, "");

  // Replace smart quotes
  candidate = candidate
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');

  // Remove JS-style comments (line and block)
  candidate = stripComments(candidate);

  // Convert single-quoted strings to double-quoted
  candidate = convertSingleQuotes(candidate);

  // Quote unquoted object keys
  candidate = quoteUnquotedKeys(candidate);

  // Remove trailing commas
  candidate = candidate.replace(/,(\s*[}\]])/g, "$1");

  try {
    const parsed: unknown = JSON.parse(candidate);
    const repaired = JSON.stringify(parsed, null, 2);
    return {
      success: true,
      repaired,
      message: "Repaired common JSON issues. Review the result before converting.",
    };
  } catch (error) {
    const detail =
      error instanceof SyntaxError ? error.message : "Unknown parse error";
    return {
      success: false,
      repaired: candidate,
      message: `Could not safely repair this JSON (${detail}). Fix remaining syntax issues manually.`,
    };
  }
}

function stripComments(source: string): string {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (inString) {
      result += ch;
      if (ch === "\\" && i + 1 < source.length) {
        result += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === stringChar) {
        inString = false;
      }
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      result += ch;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      i += 2;
      while (i + 1 < source.length && !(source[i] === "*" && source[i + 1] === "/")) {
        i += 1;
      }
      i += 2;
      continue;
    }

    result += ch;
    i += 1;
  }

  return result;
}

function convertSingleQuotes(source: string): string {
  let result = "";
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === '"') {
      result += ch;
      i += 1;
      while (i < source.length) {
        const c = source[i];
        result += c;
        if (c === "\\" && i + 1 < source.length) {
          result += source[i + 1];
          i += 2;
          continue;
        }
        if (c === '"') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === "'") {
      result += '"';
      i += 1;
      while (i < source.length) {
        const c = source[i];
        if (c === "\\" && i + 1 < source.length) {
          const escaped = source[i + 1];
          if (escaped === "'") {
            result += "'";
          } else if (escaped === '"') {
            result += '\\"';
          } else {
            result += `\\${escaped}`;
          }
          i += 2;
          continue;
        }
        if (c === "'") {
          result += '"';
          i += 1;
          break;
        }
        if (c === '"') {
          result += '\\"';
          i += 1;
          continue;
        }
        result += c;
        i += 1;
      }
      continue;
    }

    result += ch;
    i += 1;
  }

  return result;
}

function quoteUnquotedKeys(source: string): string {
  // Matches { or , followed by whitespace and an unquoted identifier key before :
  return source.replace(
    /([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g,
    '$1"$2"$3',
  );
}

export function formatJson(input: string): RepairResult {
  try {
    const parsed: unknown = JSON.parse(input);
    return {
      success: true,
      repaired: JSON.stringify(parsed, null, 2),
      message: "Formatted successfully.",
    };
  } catch (error) {
    const detail =
      error instanceof SyntaxError ? error.message : "Invalid JSON";
    return {
      success: false,
      repaired: input,
      message: `Cannot format: ${detail}`,
    };
  }
}
