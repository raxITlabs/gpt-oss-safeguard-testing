import { TestCategory } from "@/types/test-results";

// Test types available in the system
export const TEST_TYPES = [
  "baseline",
  "multi-turn",
  "multi_turn", // backward compatibility
  "prompt-injection",
  "prompt_injection", // backward compatibility
  "over-refusal",
  "over_refusal", // backward compatibility
] as const;

export type TestTypeValue = typeof TEST_TYPES[number];

// All baseline categories
export const ALL_BASELINE_CATEGORIES: TestCategory[] = [
  "spam",
  "hate-speech",
  "violence",
  "sexual-content",
  "self-harm",
  "fraud",
  "illegal-activity",
  "unicode",
  "data-exfiltration",
  "multi-policy",
  "request-vs-depiction",
  "risk-tiering",
  "unauthorized-actions",
];

// Attack test types (non-baseline)
export const ATTACK_TEST_TYPES: TestTypeValue[] = [
  "multi-turn",
  "multi_turn",
  "prompt-injection",
  "prompt_injection",
  "over-refusal",
  "over_refusal",
];

// Critical safety categories
export const CRITICAL_CATEGORIES: TestCategory[] = [
  "spam",
  "hate-speech",
  "violence",
  "sexual-content",
];

// Policy violation categories
export const POLICY_CATEGORIES: TestCategory[] = [
  "fraud",
  "illegal-activity",
  "unauthorized-actions",
];

// Security-focused categories
export const SECURITY_CATEGORIES: TestCategory[] = [
  "data-exfiltration",
  "unicode",
  "unauthorized-actions",
];

// Edge case categories
export const EDGE_CASE_CATEGORIES: TestCategory[] = [
  "multi-policy",
  "request-vs-depiction",
  "risk-tiering",
];

// Category groups for organized display
export interface CategoryGroup {
  label: string;
  categories: TestCategory[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: "Safety",
    categories: ["spam", "hate-speech", "violence", "sexual-content", "self-harm"],
  },
  {
    label: "Policy & Legal",
    categories: ["fraud", "illegal-activity", "unauthorized-actions"],
  },
  {
    label: "Security",
    categories: ["data-exfiltration", "unicode"],
  },
  {
    label: "Edge Cases",
    categories: ["multi-policy", "request-vs-depiction", "risk-tiering"],
  },
];

// Filter preset definitions
export interface FilterPreset {
  id: string;
  label: string;
  description: string;
  categories: TestCategory[] | "all";
  testTypes: TestTypeValue[] | "all";
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "all",
    label: "All Tests",
    description: "Show all tests across all categories and types",
    categories: "all",
    testTypes: "all",
  },
  {
    id: "all-baseline",
    label: "All Baseline",
    description: "All baseline content policy tests",
    categories: ALL_BASELINE_CATEGORIES,
    testTypes: ["baseline"],
  },
  {
    id: "all-attacks",
    label: "All Attacks",
    description: "All attack scenarios (multi-turn, prompt injection, over-refusal)",
    categories: "all",
    testTypes: ATTACK_TEST_TYPES,
  },
  {
    id: "critical",
    label: "Critical",
    description: "Critical safety categories: spam, hate-speech, violence, sexual-content",
    categories: CRITICAL_CATEGORIES,
    testTypes: "all",
  },
  {
    id: "policy",
    label: "Policy",
    description: "Policy violations: fraud, illegal activity, unauthorized actions",
    categories: POLICY_CATEGORIES,
    testTypes: "all",
  },
  {
    id: "security",
    label: "Security",
    description: "Security-focused: data exfiltration, unicode, unauthorized actions",
    categories: SECURITY_CATEGORIES,
    testTypes: "all",
  },
  {
    id: "edge-cases",
    label: "Edge Cases",
    description: "Edge case testing: multi-policy, request vs depiction, risk tiering",
    categories: EDGE_CASE_CATEGORIES,
    testTypes: "all",
  },
];

// Helper to get a preset by ID
export function getPreset(id: string): FilterPreset | undefined {
  return FILTER_PRESETS.find((preset) => preset.id === id);
}

// Helper to format category labels
export function formatCategoryLabel(category: TestCategory): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to format test type labels
export function formatTestTypeLabel(testType: string): string {
  // Normalize variations
  const normalized = testType.replace(/_/g, "-");

  return normalized
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
