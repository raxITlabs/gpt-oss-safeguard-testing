/**
 * Utilities for cost analysis and budget projection
 */

import type { InferenceEvent } from "@/types/test-results";
import type {
  CostAccuracyPoint,
  CostEfficiencyMetrics,
  CategoryCostBreakdown,
  BudgetProjection,
  CategoryMixInput,
  TokenEconomics,
  TokenDistributionBin,
  OptimizationOpportunity,
} from "@/types/analytics";
import { analyzeFailure } from "@/lib/failure-analyzer";

/**
 * Extract cost from inference event (handles both old and new formats)
 */
function getCost(inf: InferenceEvent): number {
  return inf.cost_usd ?? inf.metrics?.cost_usd ?? 0;
}

/**
 * Extract latency from inference event (handles both old and new formats)
 */
function getLatency(inf: InferenceEvent): number {
  return inf.latency_ms ?? inf.metrics?.latency_ms ?? 0;
}

/**
 * Extract tokens from inference event (handles both old and new formats)
 */
function getTokens(inf: InferenceEvent): { prompt: number; completion: number; total: number; reasoning: number } {
  if (inf.tokens) {
    return {
      prompt: inf.tokens.prompt ?? 0,
      completion: inf.tokens.completion ?? 0,
      total: inf.tokens.total ?? 0,
      reasoning: inf.tokens.reasoning ?? 0,
    };
  }

  if (inf.usage) {
    return {
      prompt: inf.usage.prompt_tokens ?? 0,
      completion: inf.usage.completion_tokens ?? 0,
      total: inf.usage.total_tokens ?? 0,
      reasoning: 0, // old format doesn't have reasoning tokens
    };
  }

  return { prompt: 0, completion: 0, total: 0, reasoning: 0 };
}

/**
 * Extract test result (handles both old and new formats)
 */
function getPassed(inf: InferenceEvent): boolean {
  return inf.passed ?? inf.test_result?.passed ?? false;
}

/**
 * Extract expected and actual values
 */
function getExpectedActual(inf: InferenceEvent): { expected: string; actual: string } {
  return {
    expected: inf.expected ?? inf.test_result?.expected ?? "UNKNOWN",
    actual: inf.model_output ?? inf.test_result?.actual ?? inf.response?.content ?? "UNKNOWN",
  };
}

/**
 * Prepare data for Cost-Accuracy scatter plot
 * @param inferences - Array of inference events
 * @param strictPolicyValidation - Whether to use strict policy validation (respects missing/hallucinated policy codes)
 */
export function prepareCostAccuracyScatterData(
  inferences: InferenceEvent[],
  strictPolicyValidation: boolean = true
): CostAccuracyPoint[] {
  return inferences.map((inf) => {
    const tokens = getTokens(inf);
    const { expected, actual } = getExpectedActual(inf);

    // Create composite key for category-test_type grouping
    const testType = inf.test_type || 'baseline';
    const categoryLabel = inf.category || 'unknown';
    const compositeCategory = `${categoryLabel}-${testType}`;

    // Use analyzeFailure to respect strict policy validation setting
    // If analyzeFailure returns null, the test passed; otherwise it failed
    const failureAnalysis = analyzeFailure(inf, strictPolicyValidation);
    const passed = failureAnalysis === null;

    return {
      testId: `${inf.test_number ?? 0}`,
      testNumber: inf.test_number ?? 0,
      testName: inf.test_name ?? 'Unknown Test',
      cost: getCost(inf),
      accuracy: passed,
      latency: getLatency(inf),
      category: compositeCategory,
      tokens: tokens.total,
      expected,
      actual,
    };
  });
}

/**
 * Calculate cost efficiency metrics
 * @param inferences - Array of inference events
 * @param strictPolicyValidation - Whether to use strict policy validation (respects missing/hallucinated policy codes)
 */
export function calculateCostEfficiency(
  inferences: InferenceEvent[],
  strictPolicyValidation: boolean = true
): CostEfficiencyMetrics {
  if (inferences.length === 0) {
    return {
      costPerTest: 0,
      costPerCorrectTest: 0,
      costPerFailedTest: 0,
      costPer1000Tokens: 0,
      totalCost: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
    };
  }

  const totalCost = inferences.reduce((sum, inf) => sum + getCost(inf), 0);
  const totalTokens = inferences.reduce((sum, inf) => sum + getTokens(inf).total, 0);

  // Use analyzeFailure to determine true correctness (respects test type and strict mode)
  // For baseline tests: analyzeFailure() === null means test passed (correct)
  // For attack tests: analyzeFailure() === null means attack was blocked (correct)
  const correctTests = inferences.filter(inf => analyzeFailure(inf, strictPolicyValidation) === null);
  const incorrectTests = inferences.filter(inf => analyzeFailure(inf, strictPolicyValidation) !== null);

  const costOfCorrectTests = correctTests.reduce((sum, inf) => sum + getCost(inf), 0);
  const costOfIncorrectTests = incorrectTests.reduce((sum, inf) => sum + getCost(inf), 0);

  return {
    costPerTest: totalCost / inferences.length,
    costPerCorrectTest: correctTests.length > 0 ? costOfCorrectTests / correctTests.length : 0,
    costPerFailedTest: incorrectTests.length > 0 ? costOfIncorrectTests / incorrectTests.length : 0,
    costPer1000Tokens: totalTokens > 0 ? (totalCost / totalTokens) * 1000 : 0,
    totalCost,
    totalTests: inferences.length,
    passedTests: correctTests.length,
    failedTests: incorrectTests.length,
  };
}

/**
 * Analyze cost breakdown by category
 */
export function analyzeCostByCategory(inferences: InferenceEvent[]): CategoryCostBreakdown[] {
  // Group by composite category-test_type key
  const byCategory = inferences.reduce((acc, inf) => {
    const testType = inf.test_type || 'baseline';
    const categoryLabel = inf.category || 'unknown';
    const compositeCategory = `${categoryLabel}-${testType}`;

    if (!acc[compositeCategory]) {
      acc[compositeCategory] = [];
    }
    acc[compositeCategory].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  // Calculate stats for each category
  return Object.entries(byCategory).map(([category, tests]) => {
    const totalCost = tests.reduce((sum, t) => sum + getCost(t), 0);
    const totalTokens = tests.reduce((sum, t) => sum + getTokens(t).total, 0);
    const totalLatency = tests.reduce((sum, t) => sum + getLatency(t), 0);

    const passedTests = tests.filter(t => getPassed(t));
    const costOfPassedTests = passedTests.reduce((sum, t) => sum + getCost(t), 0);

    return {
      category,
      totalCost,
      avgCost: totalCost / tests.length,
      totalTests: tests.length,
      passRate: (passedTests.length / tests.length) * 100,
      costPerCorrectTest: passedTests.length > 0 ? costOfPassedTests / passedTests.length : 0,
      avgTokens: totalTokens / tests.length,
      avgLatency: totalLatency / tests.length,
    };
  }).sort((a, b) => b.totalCost - a.totalCost); // Sort by total cost descending
}

/**
 * Calculate budget projections for production scaling
 */
export function calculateBudgetProjections(
  inferences: InferenceEvent[],
  dailyRequests: number,
  categoryMix: CategoryMixInput[]
): BudgetProjection {
  const categoryBreakdown = analyzeCostByCategory(inferences);

  // Calculate weighted average cost based on category mix
  let weightedAvgCost = 0;
  let weightedAvgLatency = 0;

  categoryMix.forEach((mix) => {
    const categoryData = categoryBreakdown.find(c => c.category === mix.category);
    if (categoryData) {
      weightedAvgCost += (categoryData.avgCost * mix.percentage) / 100;
      weightedAvgLatency += (categoryData.avgLatency * mix.percentage) / 100;
    }
  });

  // Calculate monthly costs
  const monthlyRequests = dailyRequests * 30;
  const yearlyRequests = dailyRequests * 365;

  const apiCallsCost = monthlyRequests * weightedAvgCost;

  // Estimate storage costs (assume 1KB per log entry, $0.023 per GB/month on S3)
  const storageCost = (monthlyRequests * 1) / 1_000_000 * 0.023;

  // Estimate false positive review cost
  // Assume $0.50 per manual review, and review rate based on failure rate
  const avgPassRate = categoryMix.reduce((sum, mix) => sum + (mix.passRate * mix.percentage) / 100, 0);
  const falseNegativeRate = (100 - avgPassRate) / 100;
  const manualReviews = monthlyRequests * falseNegativeRate;
  const falsePositiveReviewCost = manualReviews * 0.50;

  const totalMonthlyCost = apiCallsCost + storageCost + falsePositiveReviewCost;
  const totalYearlyCost = totalMonthlyCost * 12;

  // Calculate P95 latency (rough estimate from avg)
  const p95Latency = weightedAvgLatency * 1.4; // Approximation: P95 ≈ 1.4x mean for typical distributions

  // Determine user impact
  let estimatedUserImpact = "Excellent UX";
  if (weightedAvgLatency > 1000) {
    estimatedUserImpact = "Noticeable delay - consider optimization";
  } else if (weightedAvgLatency > 700) {
    estimatedUserImpact = "Acceptable but could be faster";
  } else if (weightedAvgLatency > 500) {
    estimatedUserImpact = "Good - minimal impact";
  }

  return {
    dailyRequests,
    monthlyRequests,
    yearlyRequests,
    categoryMix,
    costs: {
      apiCallsCost,
      storageCost,
      falsePositiveReviewCost,
      totalMonthlyCost,
      totalYearlyCost,
    },
    performance: {
      avgLatency: weightedAvgLatency,
      p95Latency,
      estimatedUserImpact,
    },
  };
}

/**
 * Analyze token economics
 */
export function analyzeTokenEconomics(inferences: InferenceEvent[]): TokenEconomics {
  if (inferences.length === 0) {
    return {
      avgPromptTokens: 0,
      avgCompletionTokens: 0,
      avgReasoningTokens: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalReasoningTokens: 0,
      promptTokenPercentage: 0,
      completionTokenPercentage: 0,
      reasoningTokenPercentage: 0,
      distribution: [],
    };
  }

  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalReasoningTokens = 0;

  // Bins for distribution
  const promptBins: Record<string, number> = {
    "<500": 0,
    "500-1000": 0,
    "1000-1500": 0,
    ">1500": 0,
  };
  const completionBins: Record<string, number> = {
    "<50": 0,
    "50-100": 0,
    "100-200": 0,
    ">200": 0,
  };
  const reasoningBins: Record<string, number> = {
    "<50": 0,
    "50-100": 0,
    "100-200": 0,
    ">200": 0,
  };

  inferences.forEach((inf) => {
    const tokens = getTokens(inf);

    totalPromptTokens += tokens.prompt;
    totalCompletionTokens += tokens.completion;
    totalReasoningTokens += tokens.reasoning;

    // Categorize prompt tokens
    if (tokens.prompt < 500) promptBins["<500"]++;
    else if (tokens.prompt < 1000) promptBins["500-1000"]++;
    else if (tokens.prompt < 1500) promptBins["1000-1500"]++;
    else promptBins[">1500"]++;

    // Categorize completion tokens
    if (tokens.completion < 50) completionBins["<50"]++;
    else if (tokens.completion < 100) completionBins["50-100"]++;
    else if (tokens.completion < 200) completionBins["100-200"]++;
    else completionBins[">200"]++;

    // Categorize reasoning tokens
    if (tokens.reasoning < 50) reasoningBins["<50"]++;
    else if (tokens.reasoning < 100) reasoningBins["50-100"]++;
    else if (tokens.reasoning < 200) reasoningBins["100-200"]++;
    else reasoningBins[">200"]++;
  });

  const totalTokens = totalPromptTokens + totalCompletionTokens;

  const distribution: TokenDistributionBin[] = [
    { range: "<500/<50/<50", promptCount: promptBins["<500"], completionCount: completionBins["<50"], reasoningCount: reasoningBins["<50"] },
    { range: "500-1000/50-100/50-100", promptCount: promptBins["500-1000"], completionCount: completionBins["50-100"], reasoningCount: reasoningBins["50-100"] },
    { range: "1000-1500/100-200/100-200", promptCount: promptBins["1000-1500"], completionCount: completionBins["100-200"], reasoningCount: reasoningBins["100-200"] },
    { range: ">1500/>200/>200", promptCount: promptBins[">1500"], completionCount: completionBins[">200"], reasoningCount: reasoningBins[">200"] },
  ];

  return {
    avgPromptTokens: totalPromptTokens / inferences.length,
    avgCompletionTokens: totalCompletionTokens / inferences.length,
    avgReasoningTokens: totalReasoningTokens / inferences.length,
    totalPromptTokens,
    totalCompletionTokens,
    totalReasoningTokens,
    promptTokenPercentage: totalTokens > 0 ? (totalPromptTokens / totalTokens) * 100 : 0,
    completionTokenPercentage: totalTokens > 0 ? (totalCompletionTokens / totalTokens) * 100 : 0,
    reasoningTokenPercentage: totalTokens > 0 ? (totalReasoningTokens / (totalPromptTokens + totalCompletionTokens + totalReasoningTokens)) * 100 : 0,
    distribution,
  };
}

/**
 * Identify cost optimization opportunities
 * @param inferences - Array of inference events
 * @param strictPolicyValidation - Whether to use strict policy validation (respects missing/hallucinated policy codes)
 */
export function identifyOptimizationOpportunities(
  inferences: InferenceEvent[],
  strictPolicyValidation: boolean = true
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  const tokenEconomics = analyzeTokenEconomics(inferences);
  const costEfficiency = calculateCostEfficiency(inferences, strictPolicyValidation);

  // Opportunity 1: Prompt length reduction
  const highPromptTokenTests = inferences.filter(inf => getTokens(inf).prompt > 1200);
  if (highPromptTokenTests.length > 0) {
    const potentialSavings = (tokenEconomics.promptTokenPercentage * 0.15) / 100; // 15% reduction
    opportunities.push({
      type: "prompt_reduction",
      title: "Reduce prompt length",
      description: `${highPromptTokenTests.length} tests have >1,200 prompt tokens`,
      currentState: `Avg prompt tokens: ${Math.round(tokenEconomics.avgPromptTokens)}`,
      proposedState: `Target: ${Math.round(tokenEconomics.avgPromptTokens * 0.85)} tokens (-15%)`,
      estimatedSavings: {
        costSavingsPercent: potentialSavings * 100,
        costSavingsUSD: costEfficiency.totalCost * potentialSavings,
      },
      risk: "medium",
      riskDescription: "May reduce accuracy by ~2%",
      affectedTests: highPromptTokenTests.length,
      implementation: "Review and simplify policy text, remove redundant examples",
    });
  }

  // Opportunity 2: Reasoning toggle for low-risk content
  if (tokenEconomics.totalReasoningTokens > 0) {
    const reasoningCostPercent = tokenEconomics.reasoningTokenPercentage / 100;
    opportunities.push({
      type: "reasoning_toggle",
      title: "Make reasoning optional for low-risk tests",
      description: "Reasoning tokens consume significant resources but may not be needed for all tests",
      currentState: `${Math.round(tokenEconomics.reasoningTokenPercentage)}% of tokens are reasoning`,
      proposedState: "Skip reasoning for SP0/SP1 tests (estimated 40% of tests)",
      estimatedSavings: {
        costSavingsPercent: reasoningCostPercent * 40,
        costSavingsUSD: costEfficiency.totalCost * reasoningCostPercent * 0.4,
      },
      risk: "low",
      riskDescription: "Low-risk content doesn't require detailed reasoning",
      affectedTests: Math.floor(inferences.length * 0.4),
      implementation: "Add conditional reasoning parameter based on severity level",
    });
  }

  // Opportunity 3: Identify expensive failures
  const expensiveFailures = inferences.filter(inf => !getPassed(inf) && getCost(inf) > costEfficiency.costPerTest * 1.5);
  if (expensiveFailures.length > 0) {
    opportunities.push({
      type: "model_selection",
      title: "Review expensive failures",
      description: `${expensiveFailures.length} tests failed despite being expensive to run`,
      currentState: `Avg cost of failures: $${costEfficiency.costPerFailedTest.toFixed(6)}`,
      proposedState: "Investigate why expensive tests are failing",
      estimatedSavings: {
        costSavingsPercent: 0,
        costSavingsUSD: 0,
      },
      risk: "low",
      riskDescription: "Investigation only - no implementation risk",
      affectedTests: expensiveFailures.length,
      implementation: "Analyze failure patterns and consider if a different model or prompt is needed",
    });
  }

  return opportunities;
}

/**
 * Prepare category mix from inference data
 */
export function prepareCategoryMixFromInferences(inferences: InferenceEvent[]): CategoryMixInput[] {
  const categoryBreakdown = analyzeCostByCategory(inferences);
  const totalTests = inferences.length;

  return categoryBreakdown.map((cat) => ({
    category: cat.category,
    percentage: (cat.totalTests / totalTests) * 100,
    avgCost: cat.avgCost,
    avgLatency: cat.avgLatency,
    passRate: cat.passRate,
  }));
}
