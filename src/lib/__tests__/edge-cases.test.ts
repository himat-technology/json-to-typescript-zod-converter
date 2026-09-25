import { describe, expect, it } from "vitest";
import { convertJson } from "@/lib/convert";
import { repairJson, formatJson } from "@/lib/parser/json-repair";
import { validateCandidatePayload } from "@/lib/validation/payload-validator";
import { PRESETS, DEFAULT_JSON } from "@/lib/presets";
import type { ConverterOptions } from "@/types/converter";

const base: ConverterOptions = {
  rootName: "Root",
  outputFormat: "both",
  optionalFields: false,
  readonlyProperties: false,
  smartStringDetection: true,
};

describe("end-to-end edge cases", () => {
  it("handles all presets with every output format", () => {
    const formats: ConverterOptions["outputFormat"][] = [
      "interface",
      "type",
      "zod",
      "both",
    ];
    for (const preset of PRESETS) {
      for (const outputFormat of formats) {
        const result = convertJson(preset.json, {
          ...base,
          rootName: preset.rootName,
          outputFormat,
        });
        expect(result.isValidJson, `${preset.id}/${outputFormat}`).toBe(true);
        expect(result.generated?.active.length).toBeGreaterThan(20);
        expect(result.parseError).toBeNull();
      }
    }
  });

  it("validates preset payloads against their own schemas", () => {
    for (const preset of PRESETS) {
      const result = convertJson(preset.json, {
        ...base,
        rootName: preset.rootName,
      });
      const ok = validateCandidatePayload(result.inference, preset.json);
      expect(ok.success, preset.id).toBe(true);

      const bad = validateCandidatePayload(
        result.inference,
        JSON.stringify({ nope: true }),
      );
      expect(bad.success, preset.id).toBe(false);
      expect(bad.issues.length).toBeGreaterThan(0);
    }
  });

  it("supports optional + readonly together", () => {
    const result = convertJson(DEFAULT_JSON, {
      ...base,
      rootName: "UserProfile",
      optionalFields: true,
      readonlyProperties: true,
      outputFormat: "interface",
    });
    expect(result.generated?.active).toMatch(/readonly \w+\?:/);
  });

  it("handles primitive roots", () => {
    for (const value of ['"hello"', "42", "true", "null"]) {
      const result = convertJson(value, base);
      expect(result.isValidJson).toBe(true);
      expect(result.generated?.active).toContain("export type Root");
    }
  });

  it("handles empty object and empty array", () => {
    const obj = convertJson("{}", { ...base, rootName: "Empty" });
    expect(obj.isValidJson).toBe(true);
    expect(obj.generated?.typescript).toContain("export interface Empty");

    const arr = convertJson("[]", base);
    expect(arr.isValidJson).toBe(true);
    expect(arr.generated?.active).toContain("unknown[]");
  });

  it("handles array root of objects", () => {
    const result = convertJson(
      JSON.stringify([
        { id: 1, name: "A" },
        { id: 2, name: "B", extra: true },
      ]),
      { ...base, rootName: "Rows" },
    );
    expect(result.isValidJson).toBe(true);
    const ts = result.generated?.typescript ?? "";
    expect(ts).toContain("export interface RowsItem");
    expect(ts).toContain("export type Rows = RowsItem[]");
    expect(ts).not.toContain("export type Rows = Rows[]");
    expect(ts).toMatch(/extra\?:/);
  });

  it("keeps JSON validity separate from root name errors", () => {
    const result = convertJson("{\"ok\":true}", { ...base, rootName: "123Bad" });
    expect(result.isValidJson).toBe(true);
    expect(result.rootNameError).toBeTruthy();
    expect(result.generated).toBeNull();
  });

  it("sanitizes weird keys", () => {
    const result = convertJson(
      JSON.stringify({
        "user-profile": { "first name": "Alex", "@id": 1, "2fa": true },
      }),
      { ...base, rootName: "Payload" },
    );
    expect(result.isValidJson).toBe(true);
    const code = result.generated?.typescript ?? "";
    expect(code).toContain("Payload_UserProfile");
    expect(code).toContain('"first name"');
    expect(code).toContain('"@id"');
    expect(code).toContain('"2fa"');
  });

  it("rejects invalid root names", () => {
    const result = convertJson("{}", { ...base, rootName: "123Bad" });
    expect(result.rootNameError).toBeTruthy();
    expect(result.generated).toBeNull();
    expect(result.isValidJson).toBe(true);
  });

  it("rejects empty and invalid JSON", () => {
    expect(convertJson("", base).isValidJson).toBe(false);
    expect(convertJson("{bad", base).isValidJson).toBe(false);
  });

  it("repairs and formats common broken JSON", () => {
    const repaired = repairJson(`{ name: 'Ada', age: 1, }`);
    expect(repaired.success).toBe(true);
    expect(JSON.parse(repaired.repaired)).toEqual({ name: "Ada", age: 1 });

    const formatted = formatJson('{"a":1}');
    expect(formatted.success).toBe(true);
    expect(formatted.repaired).toContain("\n");
  });

  it("detects smart strings in zod output only when enabled", () => {
    const on = convertJson(
      JSON.stringify({
        email: "a@b.com",
        url: "https://x.com",
        at: "2026-09-25T08:30:00Z",
      }),
      { ...base, smartStringDetection: true, outputFormat: "zod" },
    );
    expect(on.generated?.zod).toContain(".email()");
    expect(on.generated?.zod).toContain(".url()");
    expect(on.generated?.zod).toContain(".datetime()");

    const off = convertJson(
      JSON.stringify({ email: "a@b.com" }),
      { ...base, smartStringDetection: false, outputFormat: "zod" },
    );
    expect(off.generated?.zod).not.toContain(".email()");
  });

  it("does not crash on deeply nested objects", () => {
    let nested: Record<string, unknown> = { value: 1 };
    for (let i = 0; i < 40; i += 1) {
      nested = { child: nested };
    }
    const result = convertJson(JSON.stringify(nested), base);
    expect(result.isValidJson).toBe(true);
    expect(result.generated?.active.length).toBeGreaterThan(0);
  });

  it("keeps statistics consistent with output", () => {
    const result = convertJson(DEFAULT_JSON, {
      ...base,
      rootName: "UserProfile",
    });
    expect(result.statistics.totalProperties).toBeGreaterThan(10);
    expect(result.statistics.nestingDepth).toBeGreaterThan(2);
    expect(result.statistics.generatedLines).toBeGreaterThan(20);
    expect(result.statistics.outputBytes).toBeGreaterThan(100);
  });

  it("flags type mismatches with useful paths", () => {
    const result = convertJson(
      JSON.stringify({ profile: { email: "a@b.com" }, count: 1 }),
      { ...base, rootName: "Data" },
    );
    const bad = validateCandidatePayload(
      result.inference,
      JSON.stringify({ profile: { email: 99 }, count: "x" }),
    );
    expect(bad.success).toBe(false);
    const paths = bad.issues.map((i) => i.path).join(" ");
    expect(paths).toMatch(/email|count|profile/);
  });
});
