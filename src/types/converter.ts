export type OutputFormat =
  | "interface"
  | "type"
  | "zod"
  | "both";

export interface ConverterOptions {
  rootName: string;
  outputFormat: OutputFormat;
  optionalFields: boolean;
  readonlyProperties: boolean;
  smartStringDetection: boolean;
}

export type StringFormat = "email" | "url" | "datetime";

export type PrimitiveKind = "string" | "number" | "boolean";

export interface PrimitiveType {
  kind: "primitive";
  value: PrimitiveKind;
  stringFormat?: StringFormat;
}

export interface NullType {
  kind: "null";
}

export interface UnknownType {
  kind: "unknown";
}

export interface ObjectProperty {
  key: string;
  type: InferredType;
  optional: boolean;
  readonly: boolean;
}

export interface ObjectType {
  kind: "object";
  name: string;
  properties: ObjectProperty[];
}

export interface ArrayType {
  kind: "array";
  element: InferredType;
}

export interface UnionType {
  kind: "union";
  types: InferredType[];
}

export type InferredType =
  | PrimitiveType
  | NullType
  | UnknownType
  | ObjectType
  | ArrayType
  | UnionType;

export interface NamedTypeDeclaration {
  name: string;
  type: ObjectType;
}

export interface InferenceResult {
  root: InferredType;
  declarations: NamedTypeDeclaration[];
}

export interface GeneratedResult {
  typescript: string;
  zod: string;
  combined: string;
  active: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

export interface ValidationResult {
  success: boolean;
  issues: ValidationIssue[];
  summary: string;
}

export interface Statistics {
  totalProperties: number;
  nestingDepth: number;
  generatedLines: number;
  outputSize: string;
  outputBytes: number;
}

export interface ParseSuccess {
  success: true;
  data: unknown;
}

export interface ParseFailure {
  success: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface RepairResult {
  success: boolean;
  repaired: string;
  message: string;
}

export type PresetId = "user-profile" | "ecommerce-order" | "ai-agent";

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  rootName: string;
  json: string;
}
