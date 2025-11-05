// Advanced analytics type definitions for production decision-making

import { InferenceEvent, TestCategory, FailureReasonType, FailurePriority } from "./test-results";

// ============================================================================
// Cost Analysis Types
// ============================================================================

export interface CostAccuracyPoint {
  testId: string;
  testNumber: number;
  testName: string;
  cost: number;
  accuracy: boolean; // passed = true, failed = false
  latency: number;
  category: string;
  tokens: number;
  expected: string;
  actual: string;
}

export interface CostEfficiencyMetrics {
  costPerTest: number;
  costPerCorrectTest: number;
  costPerFailedTest: number;
  costPer1000Tokens: number;
  totalCost: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface CategoryCostBreakdown {
  category: string;
  totalCost: number;
  avgCost: number;
  totalTests: number;
  passRate: number;
  costPerCorrectTest: number;
  avgTokens: number;
  avgLatency: number;
}

export interface BudgetProjection {
  dailyRequests: number;
  monthlyRequests: number;
  yearlyRequests: number;
  categoryMix: CategoryMixInput[];
  costs: {
    apiCallsCost: number;
    storageCost: number;
    falsePositiveReviewCost: number;
    totalMonthlyCost: number;
    totalYearlyCost: number;
  };
  performance: {
    avgLatency: number;
    p95Latency: number;
    estimatedUserImpact: string;
  };
}

export interface CategoryMixInput {
  category: string;
  percentage: number;
  avgCost: number;
  avgLatency: number;
  passRate: number;
}

export interface TokenEconomics {
  avgPromptTokens: number;
  avgCompletionTokens: number;
  avgReasoningTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalReasoningTokens: number;
  promptTokenPercentage: number;
  completionTokenPercentage: number;
  reasoningTokenPercentage: number;
  distribution: TokenDistributionBin[];
}

export interface TokenDistributionBin {
  range: string;
  promptCount: number;
  completionCount: number;
  reasoningCount: number;
}

// ============================================================================
// Performance Analysis Types
// ============================================================================

export interface LatencyPercentiles {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  outliers: TestOutlier[];
}

export interface TestOutlier {
  test: InferenceEvent;
  testNumber: number;
  testName: string;
  latency: number;
  deviationFromMean: number;
  category: string;
  cost: number;
  tokens: number;
  passed: boolean;
}

export interface LatencyDistribution {
  bins: LatencyBin[];
  p50Line: number;
  p95Line: number;
  p99Line: number;
  slaThreshold?: number;
}

export interface LatencyBin {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
  label: string;
}

export interface SLACompliance {
  threshold: number;
  testsWithinSLA: number;
  testsViolatingSLA: number;
  compliancePercentage: number;
  violations: TestOutlier[];
  avgViolationAmount: number;
}

export interface LatencyTokenCorrelation {
  dataPoints: LatencyTokenPoint[];
  correlationCoefficient: number;
  trend: "positive" | "negative" | "none";
}

export interface LatencyTokenPoint {
  testNumber: number;
  testName: string;
  tokens: number;
  latency: number;
  category: string;
  passed: boolean;
  cost: number;
}

export interface PerformanceMetricsSummary {
  latency: LatencyPercentiles;
  tokens: TokenEconomics;
  sla: SLACompliance | null;
  fastestTest: TestOutlier;
  slowestTest: TestOutlier;
  categoryPerformance: CategoryPerformanceMetrics[];
}

export interface CategoryPerformanceMetrics {
  category: string;
  avgLatency: number;
  p95Latency: number;
  minLatency: number;
  maxLatency: number;
  avgTokens: number;
  testCount: number;
}

// ============================================================================
// Enhanced Failure Analysis Types
// ============================================================================

export interface FailurePatternGroup {
  reasonType: FailureReasonType;
  displayName: string;
  description: string;
  count: number;
  percentage: number;
  tests: InferenceEvent[];
  priority: FailurePriority;
  recommendations: ActionableRecommendation[];
  missingPolicyCodes?: string[];
  avgCost: number;
  avgLatency: number;
}

export interface ActionableRecommendation {
  title: string;
  description: string;
  priority: FailurePriority;
  estimatedImpact: string;
  actionType: "fix_prompt" | "review_policy" | "investigate" | "retrain";
  affectedTests: number;
}

export interface FailureDistribution {
  byReason: FailureReasonDistribution[];
  byCategory: CategoryFailureDistribution[];
  totalFailures: number;
}

export interface FailureReasonDistribution {
  reasonType: FailureReasonType;
  displayName: string;
  count: number;
  percentage: number;
  color: string;
  category?: string; // Predominant category for this failure reason
}

export interface CategoryFailureDistribution {
  category: string;
  total: number;
  failed: number;
  passed: number;
  failureRate: number;
  topFailureReason: FailureReasonType | null;
}

// ============================================================================
// Executive Summary Types
// ============================================================================

export interface KeyInsight {
  type: "success" | "warning" | "critical" | "info";
  title: string;
  description: string;
  metric?: string;
  actionable: boolean;
  linkedDashboard?: "cost" | "performance" | "failures" | "results";
}

export interface ExecutiveSummary {
  overallStatus: "excellent" | "good" | "needs-attention" | "critical";
  keyInsights: KeyInsight[];
  alerts: Alert[];
  topRecommendation: ActionableRecommendation | null;
}

export interface Alert {
  severity: "high" | "medium" | "low";
  type: "cost" | "performance" | "quality" | "budget";
  title: string;
  description: string;
  threshold?: number;
  actual?: number;
  affectedTests?: number;
}

// ============================================================================
// Optimization Analysis Types
// ============================================================================

export interface OptimizationOpportunity {
  type: "prompt_reduction" | "reasoning_toggle" | "model_selection" | "batching";
  title: string;
  description: string;
  currentState: string;
  proposedState: string;
  estimatedSavings: {
    costSavingsPercent: number;
    costSavingsUSD: number;
    latencySavingsPercent?: number;
    latencySavingsMs?: number;
  };
  risk: "low" | "medium" | "high";
  riskDescription: string;
  affectedTests: number;
  implementation: string;
}

// ============================================================================
// Chart Data Preparation Types
// ============================================================================

export interface ScatterChartData {
  data: CostAccuracyPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  categories: string[];
}

export interface BarChartData {
  data: Array<{
    category: string;
    value: number;
    label?: string;
    [key: string]: string | number | undefined;
  }>;
  xAxisLabel: string;
  yAxisLabel: string;
}

export interface PieChartData {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  total: number;
}

export interface LineChartData {
  data: Array<{
    x: number | string;
    y: number;
    label?: string;
    [key: string]: string | number | undefined;
  }>;
  xAxisLabel: string;
  yAxisLabel: string;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  format: "csv" | "pdf" | "json" | "png";
  includeCharts: boolean;
  includeSummary: boolean;
  includeRecommendations: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  data?: Blob | string;
  error?: string;
}

// ============================================================================
// Dashboard State Types
// ============================================================================

export interface DashboardFilters {
  categories: string[];
  passedOnly: boolean;
  failedOnly: boolean;
  latencyMin?: number;
  latencyMax?: number;
  costMin?: number;
  costMax?: number;
  slaViolationsOnly: boolean;
}

export interface DashboardSettings {
  slaThreshold: number;
  costBudget: number;
  targetAccuracy: number;
  chartColors: ChartColorScheme;
}

export interface ChartColorScheme {
  cost: {
    low: string;
    medium: string;
    high: string;
  };
  performance: {
    fast: string;
    average: string;
    slow: string;
  };
  quality: {
    high: string;
    medium: string;
    low: string;
  };
  status: {
    passed: string;
    failed: string;
  };
  categories: Record<string, string>;
}
