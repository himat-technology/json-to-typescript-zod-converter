import { describe, expect, it } from "vitest";
import { parseJson, validateRootName } from "@/lib/parser/json-parser";
import { repairJson } from "@/lib/parser/json-repair";
import { inferTypes, detectStringFormat } from "@/lib/parser/type-inference";
import { generateTypeScript } from "@/lib/generators/typescript-generator";
import { generateZod } from "@/lib/generators/zod-generator";
import { buildZodSchema, validatePayload } from "@/lib/validation/schema-builder";
import { convertJson } from "@/lib/convert";
import type { ConverterOptions } from "@/types/converter";

const baseOptions: ConverterOptions = {
  rootName: "Root",
  outputFormat: "both",
  optionalFields: false,
  readonlyProperties: false,
  smartStringDetection: true,
};

describe("json-parser", () => {
  it("parses valid JSON", () => {
    const result = parseJson('{"name":"Alex"}');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Alex" });
    }
  });

  it("rejects invalid JSON", () => {
    const result = parseJson("{name:}");
    expect(result.success).toBe(false);
  });

  it("rejects empty input", () => {
    const result = parseJson("   ");
    expect(result.success).toBe(false);
  });

  it("validates root names", () => {
    expect(validateRootName("UserProfile")).toBeNull();
    expect(validateRootName("123Bad")).not.toBeNull();
    expect(validateRootName("interface")).not.toBeNull();
  });
});

describe("json-repair", () => {
  it("repairs unquoted keys and trailing commas", () => {
    const result = repairJson(`{
  name: "John",
  age: 30,
}`);
    expect(result.success).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ name: "John", age: 30 });
  });

  it("repairs single quotes", () => {
    const result = repairJson(`{'name': 'Alex'}`);
    expect(result.success).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ name: "Alex" });
  });
});

describe("type inference", () => {
  it("infers primitives", () => {
    const inference = inferTypes(
      { name: "Alex", age: 30, active: true },
      baseOptions,
    );
    expect(inference.root.kind).toBe("object");
    if (inference.root.kind === "object") {
      const byKey = Object.fromEntries(
        inference.root.properties.map((p) => [p.key, p.type]),
      );
      expect(byKey.name).toEqual({ kind: "primitive", value: "string" });
      expect(byKey.age).toEqual({ kind: "primitive", value: "number" });
      expect(byKey.active).toEqual({ kind: "primitive", value: "boolean" });
    }
  });

  it("infers nested objects with deterministic names", () => {
    const inference = inferTypes(
      { user: { profile: { name: "Alex" } } },
      { ...baseOptions, rootName: "Root" },
    );
    const names = inference.declarations.map((d) => d.name);
    expect(names).toContain("Root");
    expect(names).toContain("Root_User");
    expect(names).toContain("Root_User_Profile");
  });

  it("infers string arrays", () => {
    const inference = inferTypes(
      { roles: ["admin", "user"] },
      baseOptions,
    );
    const roles = inference.root.kind === "object"
      ? inference.root.properties.find((p) => p.key === "roles")?.type
      : null;
    expect(roles).toEqual({
      kind: "array",
      element: { kind: "primitive", value: "string" },
    });
  });

  it("infers object arrays", () => {
    const inference = inferTypes(
      { users: [{ id: 1, name: "Alex" }] },
      { ...baseOptions, rootName: "Root" },
    );
    const users = inference.root.kind === "object"
      ? inference.root.properties.find((p) => p.key === "users")?.type
      : null;
    expect(users?.kind).toBe("array");
    if (users?.kind === "array") {
      expect(users.element.kind).toBe("object");
    }
  });

  it("infers null", () => {
    const inference = inferTypes({ value: null }, baseOptions);
    const value = inference.root.kind === "object"
      ? inference.root.properties.find((p) => p.key === "value")?.type
      : null;
    expect(value).toEqual({ kind: "null" });
  });

  it("infers mixed arrays as unions", () => {
    const inference = inferTypes(
      { values: [1, "two", true] },
      baseOptions,
    );
    const values = inference.root.kind === "object"
      ? inference.root.properties.find((p) => p.key === "values")?.type
      : null;
    expect(values?.kind).toBe("array");
    if (values?.kind === "array") {
      expect(values.element.kind).toBe("union");
    }
  });

  it("handles empty arrays as unknown[]", () => {
    const inference = inferTypes({ items: [] }, baseOptions);
    const items = inference.root.kind === "object"
      ? inference.root.properties.find((p) => p.key === "items")?.type
      : null;
    expect(items).toEqual({
      kind: "array",
      element: { kind: "unknown" },
    });
  });

  it("sanitizes invalid property keys for type names", () => {
    const inference = inferTypes(
      { "user-profile": { "first-name": "Alex" } },
      { ...baseOptions, rootName: "Root" },
    );
    const names = inference.declarations.map((d) => d.name);
    expect(names).toContain("Root_UserProfile");
  });
});

describe("smart string detection", () => {
  it("detects email, url, and datetime", () => {
    expect(detectStringFormat("alex@example.com")).toBe("email");
    expect(detectStringFormat("https://example.com")).toBe("url");
    expect(detectStringFormat("2026-09-25T08:30:00Z")).toBe("datetime");
    expect(detectStringFormat("not-an-email")).toBeUndefined();
  });
});

describe("typescript generator", () => {
  it("generates interfaces dynamically", () => {
    const inference = inferTypes(
      { productId: 123, productName: "MacBook", price: 999 },
      { ...baseOptions, rootName: "Product" },
    );
    const code = generateTypeScript(inference, {
      rootName: "Product",
      outputFormat: "interface",
    });
    expect(code).toContain("export interface Product");
    expect(code).toContain("productId: number;");
    expect(code).toContain("productName: string;");
    expect(code).toContain("price: number;");
  });

  it("supports optional and readonly", () => {
    const inference = inferTypes(
      { username: "alex" },
      {
        ...baseOptions,
        rootName: "User",
        optionalFields: true,
        readonlyProperties: true,
      },
    );
    const code = generateTypeScript(inference, {
      rootName: "User",
      outputFormat: "interface",
    });
    expect(code).toContain("readonly username?: string;");
  });

  it("generates type aliases", () => {
    const inference = inferTypes(
      { id: "1" },
      { ...baseOptions, rootName: "Item" },
    );
    const code = generateTypeScript(inference, {
      rootName: "Item",
      outputFormat: "type",
    });
    expect(code).toContain("export type Item = {");
  });
});

describe("zod generator + validation", () => {
  it("generates zod schemas", () => {
    const inference = inferTypes(
      {
        email: "alex@example.com",
        avatarUrl: "https://example.com/a.png",
        lastLogin: "2026-09-25T08:30:00Z",
      },
      { ...baseOptions, rootName: "UserProfile" },
    );
    const code = generateZod(inference, {
      rootName: "UserProfile",
      smartStringDetection: true,
    });
    expect(code).toContain('import { z } from "zod"');
    expect(code).toContain("userProfileSchema");
    expect(code).toContain("z.string().email()");
    expect(code).toContain("z.string().url()");
    expect(code).toContain("z.string().datetime()");
  });

  it("validates matching payloads", () => {
    const inference = inferTypes(
      { name: "Alex", age: 30 },
      { ...baseOptions, rootName: "Person" },
    );
    const schema = buildZodSchema(inference);
    const ok = validatePayload(schema, { name: "Alex", age: 30 });
    expect(ok.success).toBe(true);
  });

  it("rejects invalid payloads with diagnostics", () => {
    const inference = inferTypes(
      { name: "Alex", age: 30 },
      { ...baseOptions, rootName: "Person" },
    );
    const schema = buildZodSchema(inference);
    const bad = validatePayload(schema, { name: "Alex", age: "thirty" });
    expect(bad.success).toBe(false);
    expect(bad.issues.some((i) => i.path.includes("age"))).toBe(true);
  });
});

describe("convertJson end-to-end", () => {
  it("produces combined output for the default user profile shape", () => {
    const result = convertJson(
      JSON.stringify({
        id: "usr_1",
        username: "alex",
        roles: ["admin"],
        profile: { firstName: "Alex" },
      }),
      { ...baseOptions, rootName: "UserProfile", outputFormat: "both" },
    );
    expect(result.isValidJson).toBe(true);
    expect(result.generated?.active).toContain("export interface UserProfile");
    expect(result.generated?.active).toContain("userProfileSchema");
    expect(result.statistics.totalProperties).toBeGreaterThan(0);
  });
});
