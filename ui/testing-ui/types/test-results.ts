// Type definitions for GPT-OSS-Safeguard test results

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Metrics {
  latency_ms: number;
  cost_usd: number;
  total_cost_usd?: number;
  average_latency_ms?: number;
  total_latency_ms?: number;
}

export interface TestResult {
  expected: string;
  actual: string;
  passed: boolean;
  reasoning?: string;
}

export interface PolicyCitation {
  cited_codes: string[];
  expected_code: string;
  cited_expected: boolean;
  cited_category: boolean;
  cited_level: boolean;
  citation_specificity: number; // 0-1 score
  hallucinated_codes: string[];
}

export interface ReasoningValidation {
  has_reasoning: boolean;
  reasoning_length: number;
  mentions_policy: boolean;
  mentions_severity: boolean;
  mentions_category: boolean;
  /**
   * Quality score on a 0-100 scale where:
   * - 0-30: Poor quality
   * - 31-60: Fair quality
   * - 61-80: Good quality
   * - 81-100: Excellent quality
   */
  quality_score: number;
  policy_citation?: PolicyCitation;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Request {
  model: string;
  messages: Message[];
}

export interface Response {
  id: string;
  model: string;
  content: string;
  finish_reason: string;
}

export interface InferenceEvent {
  event_type: "inference";
  timestamp: string;
  test_number?: number;  // Made optional for backward compatibility
  test_name?: string;    // Made optional for backward compatibility
  test_id?: string;      // Added for fallback display
  test_type?: string;
  category?: string;

  // Multi-turn specific fields for fallback display
  conversation_id?: string;
  turn_number?: number;
  attack_pattern?: string;
  attack_turn?: boolean;
  attack_succeeded?: boolean;
  false_positive?: boolean;
  expected?: string;
  model_output?: string;
  reasoning?: string;
  expected_policy?: string;

  request: Request;
  response: Response;

  // New format fields (flat structure)
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
    reasoning?: number;
  };
  cost_usd?: number;
  latency_ms?: number;
  content?: string;
  passed?: boolean;

  // Old format fields (nested structure) - for backward compatibility
  usage?: Usage;
  metrics?: Metrics;
  test_result?: TestResult;

  // Common fields
  reasoning_validation?: ReasoningValidation;
}

export interface SessionStart {
  event_type: "session_start";
  timestamp: string;
  model: string;
  test_type?: string;
  category?: string;
  total_tests?: number;
  debug_mode?: boolean;
  single_test?: number | null;
  log_file: string;
}

export interface SessionEnd {
  event_type: "session_end";
  timestamp: string;
  results: {
    test_type?: string;
    category?: string;
    total_tests: number;
    passed: number;
    failed: number;
    accuracy: number;
  };
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  avg_latency: number;
  reasoning_quality?: {
    average: number;
    presence_rate: number;
  };
}

export interface FailureDetail {
  test_name: string | undefined;
  expected: string;
  actual: string;
}

export interface SessionSummaryResults {
  total_tests: number;
  passed: number;
  failed: number;
  accuracy_percent: number;
}

export interface SessionSummaryUsage {
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
}

export interface SessionSummary {
  event_type: "session_summary";
  timestamp: string;
  model: string;
  results: SessionSummaryResults;
  usage: SessionSummaryUsage;
  metrics: Metrics;
  failures: FailureDetail[];
}

export interface ErrorEvent {
  event_type: "error";
  timestamp: string;
  error: string;
  [key: string]: unknown;
}

export type LogEntry = SessionStart | InferenceEvent | SessionSummary | SessionEnd | ErrorEvent;

// Aggregate data structure for dashboard
export interface TestRunData {
  sessionStart: SessionStart | null;
  sessionSummary: SessionSummary | null;
  inferences: InferenceEvent[];
  errors: ErrorEvent[];
}

// Log file metadata
export interface LogFileInfo {
  filename: string;
  path: string;
  timestamp: Date;
  category?: string;
  model?: string;
}

// Categories
export type TestCategory =
  | "spam"
  | "hate-speech"
  | "violence"
  | "sexual-content"
  | "self-harm"
  | "fraud"
  | "illegal-activity"
  | "unicode"
  | "data-exfiltration"
  | "multi-policy"
  | "request-vs-depiction"
  | "risk-tiering"
  | "unauthorized-actions";

export const TEST_CATEGORIES: TestCategory[] = [
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
  "unauthorized-actions"
];

// Test types from CSV
export type TestType = "baseline" | "edge_case" | "stress";

// Filter options
export interface FilterOptions {
  category?: TestCategory | "all";
  status?: "all" | "passed" | "failed";
  testType?: TestType | "all";
  search?: string;
}

// Failure analysis types
export type FailureReasonType =
  | "missing_policy_code"
  | "wrong_classification"
  | "low_reasoning_quality"
  | "no_reasoning"
  | "policy_not_mentioned";

export type FailurePriority = "high" | "medium" | "low";

export interface FailureAnalysis {
  test: InferenceEvent;
  primaryReason: string;
  reasonType: FailureReasonType;
  allReasons: string[];
  priority: FailurePriority;
  missingPolicyCodes?: string[];
  expectedClassification: string;
  actualClassification: string;
}

export interface FailureGroup {
  reasonType: FailureReasonType;
  description: string;
  count: number;
  tests: InferenceEvent[];
  priority: FailurePriority;
}
