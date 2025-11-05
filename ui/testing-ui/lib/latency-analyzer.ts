/**
 * Utilities for latency and performance analysis with percentile calculations
 */

import type { InferenceEvent } from "@/types/test-results";
import type {
  LatencyPercentiles,
  TestOutlier,
  LatencyDistribution,
  LatencyBin,
  SLACompliance,
  LatencyTokenCorrelation,
  LatencyTokenPoint,
  PerformanceMetricsSummary,
  CategoryPerformanceMetrics,
} from "@/types/analytics";

/**
 * Extract latency from inference event (handles both old and new formats)
 */
function getLatency(inf: InferenceEvent): number {
  return inf.latency_ms ?? inf.metrics?.latency_ms ?? 0;
}

/**
 * Extract cost from inference event (handles both old and new formats)
 */
function getCost(inf: InferenceEvent): number {
  return inf.cost_usd ?? inf.metrics?.cost_usd ?? 0;
}

/**
 * Extract tokens from inference event (handles both old and new formats)
 */
function getTotalTokens(inf: InferenceEvent): number {
  return inf.tokens?.total ?? inf.usage?.total_tokens ?? 0;
}

/**
 * Extract test result (handles both old and new formats)
 */
function getPassed(inf: InferenceEvent): boolean {
  return inf.passed ?? inf.test_result?.passed ?? false;
}

/**
 * Create composite category-test_type key for grouping
 */
function getCombinedCategory(category: string | null | undefined, test_type: string | null | undefined): string {
  const testType = test_type || 'baseline';
  const categoryLabel = category || 'unknown';
  return `${categoryLabel}-${testType}`;
}

/**
 * Calculate percentiles from a sorted array
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sortedValues[lower];
  }

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate comprehensive latency percentiles
 */
export function calculateLatencyPercentiles(inferences: InferenceEvent[]): LatencyPercentiles {
  if (inferences.length === 0) {
    return {
      p50: 0,
      p95: 0,
      p99: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      outliers: [],
    };
  }

  const latencies = inferences.map(inf => getLatency(inf));
  const sortedLatencies = [...latencies].sort((a, b) => a - b);

  const min = sortedLatencies[0];
  const max = sortedLatencies[sortedLatencies.length - 1];
  const mean = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
  const median = calculatePercentile(sortedLatencies, 50);
  const p50 = median;
  const p95 = calculatePercentile(sortedLatencies, 95);
  const p99 = calculatePercentile(sortedLatencies, 99);

  // Identify outliers (>2 standard deviations from mean)
  const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / latencies.length;
  const stdDev = Math.sqrt(variance);
  const outlierThreshold = mean + (2 * stdDev);

  const outliers: TestOutlier[] = inferences
    .filter(inf => getLatency(inf) > outlierThreshold)
    .map(inf => ({
      test: inf,
      testNumber: inf.test_number,
      testName: inf.test_name,
      latency: getLatency(inf),
      deviationFromMean: getLatency(inf) - mean,
      category: getCombinedCategory(inf.category, inf.test_type),
      cost: getCost(inf),
      tokens: getTotalTokens(inf),
      passed: getPassed(inf),
    }))
    .sort((a, b) => b.latency - a.latency);

  return {
    p50,
    p95,
    p99,
    min,
    max,
    mean,
    median,
    outliers,
  };
}

/**
 * Prepare latency distribution data for histogram
 */
export function prepareLatencyDistribution(
  inferences: InferenceEvent[],
  binCount: number = 10
): LatencyDistribution {
  if (inferences.length === 0) {
    return {
      bins: [],
      p50Line: 0,
      p95Line: 0,
      p99Line: 0,
    };
  }

  const latencies = inferences.map(inf => getLatency(inf));
  const sortedLatencies = [...latencies].sort((a, b) => a - b);

  const min = sortedLatencies[0];
  const max = sortedLatencies[sortedLatencies.length - 1];
  const range = max - min;
  const binSize = range / binCount;

  // Create bins
  const bins: LatencyBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const rangeStart = min + (i * binSize);
    const rangeEnd = i === binCount - 1 ? max + 1 : min + ((i + 1) * binSize);

    const count = latencies.filter(lat => lat >= rangeStart && lat < rangeEnd).length;
    const percentage = (count / latencies.length) * 100;

    bins.push({
      rangeStart: Math.round(rangeStart),
      rangeEnd: Math.round(rangeEnd),
      count,
      percentage,
      label: `${Math.round(rangeStart)}-${Math.round(rangeEnd)}ms`,
    });
  }

  const percentiles = calculateLatencyPercentiles(inferences);

  return {
    bins,
    p50Line: percentiles.p50,
    p95Line: percentiles.p95,
    p99Line: percentiles.p99,
  };
}

/**
 * Calculate SLA compliance metrics
 */
export function calculateSLACompliance(
  inferences: InferenceEvent[],
  slaThreshold: number
): SLACompliance {
  if (inferences.length === 0) {
    return {
      threshold: slaThreshold,
      testsWithinSLA: 0,
      testsViolatingSLA: 0,
      compliancePercentage: 0,
      violations: [],
      avgViolationAmount: 0,
    };
  }

  const violations: TestOutlier[] = [];
  let totalViolationAmount = 0;

  inferences.forEach(inf => {
    const latency = getLatency(inf);
    if (latency > slaThreshold) {
      violations.push({
        test: inf,
        testNumber: inf.test_number,
        testName: inf.test_name,
        latency,
        deviationFromMean: latency - slaThreshold,
        category: getCombinedCategory(inf.category, inf.test_type),
        cost: getCost(inf),
        tokens: getTotalTokens(inf),
        passed: getPassed(inf),
      });
      totalViolationAmount += latency - slaThreshold;
    }
  });

  const testsViolatingSLA = violations.length;
  const testsWithinSLA = inferences.length - testsViolatingSLA;
  const compliancePercentage = (testsWithinSLA / inferences.length) * 100;
  const avgViolationAmount = testsViolatingSLA > 0 ? totalViolationAmount / testsViolatingSLA : 0;

  return {
    threshold: slaThreshold,
    testsWithinSLA,
    testsViolatingSLA,
    compliancePercentage,
    violations: violations.sort((a, b) => b.latency - a.latency),
    avgViolationAmount,
  };
}

/**
 * Analyze correlation between latency and tokens
 */
export function analyzeLatencyTokenCorrelation(inferences: InferenceEvent[]): LatencyTokenCorrelation {
  if (inferences.length === 0) {
    return {
      dataPoints: [],
      correlationCoefficient: 0,
      trend: "none",
    };
  }

  const dataPoints: LatencyTokenPoint[] = inferences.map(inf => ({
    testNumber: inf.test_number,
    testName: inf.test_name,
    tokens: getTotalTokens(inf),
    latency: getLatency(inf),
    category: getCombinedCategory(inf.category, inf.test_type),
    passed: getPassed(inf),
    cost: getCost(inf),
  }));

  // Calculate Pearson correlation coefficient
  const n = dataPoints.length;
  const sumTokens = dataPoints.reduce((sum, pt) => sum + pt.tokens, 0);
  const sumLatency = dataPoints.reduce((sum, pt) => sum + pt.latency, 0);
  const sumTokensLatency = dataPoints.reduce((sum, pt) => sum + (pt.tokens * pt.latency), 0);
  const sumTokensSquared = dataPoints.reduce((sum, pt) => sum + (pt.tokens * pt.tokens), 0);
  const sumLatencySquared = dataPoints.reduce((sum, pt) => sum + (pt.latency * pt.latency), 0);

  const numerator = (n * sumTokensLatency) - (sumTokens * sumLatency);
  const denominator = Math.sqrt(
    ((n * sumTokensSquared) - (sumTokens * sumTokens)) *
    ((n * sumLatencySquared) - (sumLatency * sumLatency))
  );

  const correlationCoefficient = denominator === 0 ? 0 : numerator / denominator;

  // Determine trend
  let trend: "positive" | "negative" | "none";
  if (correlationCoefficient > 0.3) {
    trend = "positive";
  } else if (correlationCoefficient < -0.3) {
    trend = "negative";
  } else {
    trend = "none";
  }

  return {
    dataPoints,
    correlationCoefficient,
    trend,
  };
}

/**
 * Analyze performance metrics by category
 */
export function analyzePerformanceByCategory(inferences: InferenceEvent[]): CategoryPerformanceMetrics[] {
  // Group by composite category-test_type key
  const byCategory = inferences.reduce((acc, inf) => {
    const compositeCategory = getCombinedCategory(inf.category, inf.test_type);
    if (!acc[compositeCategory]) {
      acc[compositeCategory] = [];
    }
    acc[compositeCategory].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  // Calculate stats for each category
  return Object.entries(byCategory).map(([category, tests]) => {
    const latencies = tests.map(t => getLatency(t));
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const tokens = tests.map(t => getTotalTokens(t));

    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / tests.length;
    const avgTokens = tokens.reduce((sum, tok) => sum + tok, 0) / tests.length;
    const p95Latency = calculatePercentile(sortedLatencies, 95);

    return {
      category,
      avgLatency,
      p95Latency,
      minLatency: sortedLatencies[0],
      maxLatency: sortedLatencies[sortedLatencies.length - 1],
      avgTokens,
      testCount: tests.length,
    };
  }).sort((a, b) => b.avgLatency - a.avgLatency); // Sort by avg latency descending
}

/**
 * Generate comprehensive performance metrics summary
 */
export function generatePerformanceSummary(
  inferences: InferenceEvent[],
  slaThreshold?: number
): PerformanceMetricsSummary {
  const latencyPercentiles = calculateLatencyPercentiles(inferences);
  const categoryPerformance = analyzePerformanceByCategory(inferences);

  // Find fastest and slowest tests
  const sortedByLatency = [...inferences].sort((a, b) => getLatency(a) - getLatency(b));
  const fastestInf = sortedByLatency[0];
  const slowestInf = sortedByLatency[sortedByLatency.length - 1];

  const fastestTest: TestOutlier = {
    test: fastestInf,
    testNumber: fastestInf.test_number,
    testName: fastestInf.test_name,
    latency: getLatency(fastestInf),
    deviationFromMean: getLatency(fastestInf) - latencyPercentiles.mean,
    category: getCombinedCategory(fastestInf.category, fastestInf.test_type),
    cost: getCost(fastestInf),
    tokens: getTotalTokens(fastestInf),
    passed: getPassed(fastestInf),
  };

  const slowestTest: TestOutlier = {
    test: slowestInf,
    testNumber: slowestInf.test_number,
    testName: slowestInf.test_name,
    latency: getLatency(slowestInf),
    deviationFromMean: getLatency(slowestInf) - latencyPercentiles.mean,
    category: getCombinedCategory(slowestInf.category, slowestInf.test_type),
    cost: getCost(slowestInf),
    tokens: getTotalTokens(slowestInf),
    passed: getPassed(slowestInf),
  };

  // Calculate token economics (simplified version)
  const totalPromptTokens = inferences.reduce((sum, inf) => {
    if (inf.tokens) {
      return sum + (inf.tokens.prompt ?? 0);
    } else if (inf.usage) {
      return sum + (inf.usage.prompt_tokens ?? 0);
    }
    return sum;
  }, 0);

  const totalCompletionTokens = inferences.reduce((sum, inf) => {
    if (inf.tokens) {
      return sum + (inf.tokens.completion ?? 0);
    } else if (inf.usage) {
      return sum + (inf.usage.completion_tokens ?? 0);
    }
    return sum;
  }, 0);

  const totalReasoningTokens = inferences.reduce((sum, inf) => {
    return sum + (inf.tokens?.reasoning ?? 0);
  }, 0);

  const totalTokensAll = totalPromptTokens + totalCompletionTokens;

  const tokens = {
    avgPromptTokens: totalPromptTokens / inferences.length,
    avgCompletionTokens: totalCompletionTokens / inferences.length,
    avgReasoningTokens: totalReasoningTokens / inferences.length,
    totalPromptTokens,
    totalCompletionTokens,
    totalReasoningTokens,
    promptTokenPercentage: totalTokensAll > 0 ? (totalPromptTokens / totalTokensAll) * 100 : 0,
    completionTokenPercentage: totalTokensAll > 0 ? (totalCompletionTokens / totalTokensAll) * 100 : 0,
    reasoningTokenPercentage: totalTokensAll > 0 ? (totalReasoningTokens / (totalTokensAll + totalReasoningTokens)) * 100 : 0,
    distribution: [],
  };

  return {
    latency: latencyPercentiles,
    tokens,
    sla: slaThreshold ? calculateSLACompliance(inferences, slaThreshold) : null,
    fastestTest,
    slowestTest,
    categoryPerformance,
  };
}
