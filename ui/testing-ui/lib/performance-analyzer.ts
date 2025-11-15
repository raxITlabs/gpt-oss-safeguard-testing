/**
 * Utilities for analyzing test performance metrics
 */

import type { InferenceEvent } from "@/types/test-results";
import { analyzeFailure } from "./failure-analyzer";

export interface PerformanceMetrics {
  avgLatency: number;
  avgCost: number;
  avgTokens: number;
  totalTokens: number;
  totalCost: number;
  passRate: number;
  latencyRange: { min: number; max: number; median: number };
  costRange: { min: number; max: number; median: number };
  tokenRange: { min: number; max: number; median: number };
  fastestTest: InferenceEvent | null;
  slowestTest: InferenceEvent | null;
  cheapestTest: InferenceEvent | null;
  mostExpensiveTest: InferenceEvent | null;
}

export interface CategoryPerformance {
  category: string;
  totalTests: number;
  passed: number;
  failed: number;
  passRate: number;
  avgLatency: number;
  avgCost: number;
  avgTokens: number;
  totalCost: number;
  totalTokens: number;
}

/**
 * Calculate average of a numeric field
 */
function calculateAverage(data: InferenceEvent[], field: string): number {
  if (data.length === 0) return 0;

  const sum = data.reduce((acc, item) => {
    const value = getNestedValue(item, field);
    return acc + (typeof value === "number" ? value : 0);
  }, 0);

  return sum / data.length;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Calculate min, max, and median
 */
function calculateRange(values: number[]): { min: number; max: number; median: number } {
  if (values.length === 0) return { min: 0, max: 0, median: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];

  return { min, max, median };
}

/**
 * Analyze overall performance metrics
 */
export function analyzePerformance(inferences: InferenceEvent[], strictPolicyValidation: boolean = true): PerformanceMetrics {
  if (inferences.length === 0) {
    return {
      avgLatency: 0,
      avgCost: 0,
      avgTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      passRate: 0,
      latencyRange: { min: 0, max: 0, median: 0 },
      costRange: { min: 0, max: 0, median: 0 },
      tokenRange: { min: 0, max: 0, median: 0 },
      fastestTest: null,
      slowestTest: null,
      cheapestTest: null,
      mostExpensiveTest: null,
    };
  }

  // Calculate averages
  const avgLatency = calculateAverage(inferences, "metrics.latency_ms");
  const avgCost = calculateAverage(inferences, "metrics.cost_usd");
  const avgTokens = calculateAverage(inferences, "usage.total_tokens");

  // Calculate totals
  const totalTokens = inferences.reduce((sum, inf) => sum + (inf.usage?.total_tokens || 0), 0);
  const totalCost = inferences.reduce((sum, inf) => sum + (inf.metrics?.cost_usd || 0), 0);

  // Calculate pass rate
  const passed = inferences.filter((inf) => analyzeFailure(inf, strictPolicyValidation) === null).length;
  const passRate = (passed / inferences.length) * 100;

  // Get value arrays for range calculations
  const latencies = inferences.map((inf) => inf.metrics?.latency_ms || 0);
  const costs = inferences.map((inf) => inf.metrics?.cost_usd || 0);
  const tokens = inferences.map((inf) => inf.usage?.total_tokens || 0);

  // Find extremes
  const fastestTest = inferences.reduce((min, inf) =>
    (!min || (inf.metrics?.latency_ms || 0) < (min.metrics?.latency_ms || Infinity)) ? inf : min
  );
  const slowestTest = inferences.reduce((max, inf) =>
    (!max || (inf.metrics?.latency_ms || 0) > (max.metrics?.latency_ms || 0)) ? inf : max
  );
  const cheapestTest = inferences.reduce((min, inf) =>
    (!min || (inf.metrics?.cost_usd || 0) < (min.metrics?.cost_usd || Infinity)) ? inf : min
  );
  const mostExpensiveTest = inferences.reduce((max, inf) =>
    (!max || (inf.metrics?.cost_usd || 0) > (max.metrics?.cost_usd || 0)) ? inf : max
  );

  return {
    avgLatency,
    avgCost,
    avgTokens,
    totalTokens,
    totalCost,
    passRate,
    latencyRange: calculateRange(latencies),
    costRange: calculateRange(costs),
    tokenRange: calculateRange(tokens),
    fastestTest,
    slowestTest,
    cheapestTest,
    mostExpensiveTest,
  };
}

/**
 * Analyze performance by category
 */
export function analyzeCategoryPerformance(inferences: InferenceEvent[], strictPolicyValidation: boolean = true): CategoryPerformance[] {
  // Group by category
  const byCategory = inferences.reduce((acc, inf) => {
    const category = inf.category || inf.test_type || "Unknown";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  // Calculate stats for each category
  return Object.entries(byCategory).map(([category, tests]) => {
    const passed = tests.filter((t) => analyzeFailure(t, strictPolicyValidation) === null).length;
    const failed = tests.length - passed;
    const passRate = (passed / tests.length) * 100;

    const avgLatency = calculateAverage(tests, "metrics.latency_ms");
    const avgCost = calculateAverage(tests, "metrics.cost_usd");
    const avgTokens = calculateAverage(tests, "usage.total_tokens");

    const totalCost = tests.reduce((sum, t) => sum + (t.metrics?.cost_usd || 0), 0);
    const totalTokens = tests.reduce((sum, t) => sum + (t.usage?.total_tokens || 0), 0);

    return {
      category,
      totalTests: tests.length,
      passed,
      failed,
      passRate,
      avgLatency,
      avgCost,
      avgTokens,
      totalCost,
      totalTokens,
    };
  }).sort((a, b) => b.totalTests - a.totalTests); // Sort by test count
}

/**
 * Prepare data for scatter chart (Latency vs Tokens)
 */
export function prepareLatencyTokenData(inferences: InferenceEvent[]) {
  return inferences.map((inf) => ({
    tokens: inf.usage?.total_tokens || 0,
    latency: inf.metrics?.latency_ms || 0,
    cost: inf.metrics?.cost_usd || 0,
    testName: inf.test_name,
    passed: inf.test_result?.passed || false,
    category: inf.category || inf.test_type || "Unknown",
  }));
}

/**
 * Prepare data for cost efficiency chart
 */
export function prepareCostEfficiencyData(inferences: InferenceEvent[]) {
  return inferences.map((inf) => ({
    tokens: inf.usage?.total_tokens || 0,
    cost: inf.metrics?.cost_usd || 0,
    costPer1KTokens: ((inf.metrics?.cost_usd || 0) / (inf.usage?.total_tokens || 1)) * 1000,
    testName: inf.test_name,
    passed: inf.test_result?.passed || false,
  }));
}
