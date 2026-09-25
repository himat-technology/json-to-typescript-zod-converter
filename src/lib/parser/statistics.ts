import type { InferenceResult, Statistics } from "@/types/converter";
import type { InferredType } from "@/types/converter";

export function computeStatistics(
  inference: InferenceResult | null,
  generatedCode: string,
): Statistics {
  const totalProperties = inference
    ? countProperties(inference.root, new Set())
    : 0;
  const nestingDepth = inference ? measureDepth(inference.root) : 0;
  const generatedLines = generatedCode
    ? generatedCode.split(/\r?\n/).length
    : 0;
  const outputBytes = new TextEncoder().encode(generatedCode).length;

  return {
    totalProperties,
    nestingDepth,
    generatedLines,
    outputBytes,
    outputSize: formatBytes(outputBytes),
  };
}

function countProperties(type: InferredType, visited: Set<string>): number {
  switch (type.kind) {
    case "object": {
      if (visited.has(type.name)) return 0;
      visited.add(type.name);
      let count = type.properties.length;
      for (const prop of type.properties) {
        count += countProperties(prop.type, visited);
      }
      return count;
    }
    case "array":
      return countProperties(type.element, visited);
    case "union":
      return type.types.reduce((sum, t) => sum + countProperties(t, visited), 0);
    default:
      return 0;
  }
}

function measureDepth(type: InferredType, visited = new Set<string>()): number {
  switch (type.kind) {
    case "object": {
      if (visited.has(type.name)) return 1;
      visited.add(type.name);
      if (type.properties.length === 0) return 1;
      return (
        1 +
        Math.max(
          ...type.properties.map((p) => measureDepth(p.type, visited)),
          0,
        )
      );
    }
    case "array":
      return 1 + measureDepth(type.element, visited);
    case "union":
      if (type.types.length === 0) return 1;
      return Math.max(...type.types.map((t) => measureDepth(t, visited)));
    default:
      return 1;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
