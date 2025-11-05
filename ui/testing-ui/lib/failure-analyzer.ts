/**
 * Utilities for analyzing test failures and extracting failure reasons
 */

import type {
  InferenceEvent,
  FailureAnalysis,
  FailureGroup,
  FailureReasonType,
  FailurePriority,
} from "@/types/test-results";
import type {
  FailurePatternGroup,
  ActionableRecommendation,
  FailureDistribution,
  FailureReasonDistribution,
  CategoryFailureDistribution,
} from "@/types/analytics";
import {
  extractPolicy,
  parsePolicy,
  extractPolicyCodes,
  analyzePolicyMentions,
} from "./policy-utils";

/**
 * Analyze a single failed test to determine why it failed
 * @param inference - The inference event to analyze
 * @param strictPolicyValidation - If false, missing policy codes won't be classified as failures
 */
export function analyzeFailure(inference: InferenceEvent, strictPolicyValidation: boolean = true): FailureAnalysis | null {
  // Only analyze failures
  if (inference.test_result?.passed) {
    return null;
  }

  const reasons: string[] = [];
  let reasonType: FailureReasonType = "wrong_classification";
  let priority: FailurePriority = "medium";
  let missingPolicyCodes: string[] | undefined;

  // Extract policy information
  const policyText = extractPolicy(inference);
  const policy = policyText ? parsePolicy(policyText) : null;

  // Check if reasoning exists
  if (!inference.reasoning) {
    reasons.push("No reasoning provided");
    reasonType = "no_reasoning";
    priority = "high";
  } else {
    // Check reasoning quality
    if (inference.reasoning_validation) {
      const qualityScore = inference.reasoning_validation.quality_score;

      // Updated threshold for 0-100 scale (was 5/10, now 50/100)
      if (qualityScore < 50) {
        reasons.push(`Low reasoning quality (${qualityScore.toFixed(0)}/100)`);
        reasonType = "low_reasoning_quality";
        priority = "high";
      }

      if (!inference.reasoning_validation.mentions_policy) {
        reasons.push("Policy not mentioned in reasoning");
        if (reasonType === "wrong_classification") {
          reasonType = "policy_not_mentioned";
        }
        priority = "high";
      }
    }

    // Check if expected policy code was referenced (use backend citation data if available)
    if (inference.reasoning_validation?.policy_citation) {
      const citation = inference.reasoning_validation.policy_citation;

      if (!citation.cited_expected && citation.expected_code) {
        reasons.push(`Missing policy code reference: ${citation.expected_code}`);
        missingPolicyCodes = [citation.expected_code];
        reasonType = "missing_policy_code";
        priority = "high";
      }

      // Check for hallucinated codes
      if (citation.hallucinated_codes.length > 0) {
        reasons.push(`Hallucinated policy codes: ${citation.hallucinated_codes.join(", ")}`);
      }
    } else if (policy && policy.code) {
      // Fallback to old client-side analysis if backend data not available
      const policyAnalysis = analyzePolicyMentions(
        inference.reasoning,
        inference.test_result?.expected ?? ""
      );

      if (policyAnalysis.missed.length > 0) {
        const missedCodes = policyAnalysis.missed.join(", ");
        reasons.push(`Missing policy code reference: ${missedCodes}`);
        missingPolicyCodes = policyAnalysis.missed;
        reasonType = "missing_policy_code";
        priority = "high";
      }
    }
  }

  // Always include classification mismatch
  const expected = inference.test_result?.expected ?? "N/A";
  const actual = inference.test_result?.actual ?? "N/A";
  reasons.push(`Classified ${expected} as ${actual}`);

  // Determine primary reason (first high-priority reason, or classification mismatch)
  const primaryReason = reasons.length > 1 ? reasons[0] : reasons[0];

  // In lenient mode, don't fail tests just for missing policy codes
  if (!strictPolicyValidation && reasonType === "missing_policy_code") {
    return null;
  }

  return {
    test: inference,
    primaryReason,
    reasonType,
    allReasons: reasons,
    priority,
    missingPolicyCodes,
    expectedClassification: expected,
    actualClassification: actual,
  };
}

/**
 * Analyze all failures and group by pattern/reason type
 */
export function groupFailuresByPattern(
  inferences: InferenceEvent[]
): FailureGroup[] {
  // Filter to only failed tests
  const failures = inferences.filter((inf) => !inf.test_result?.passed);

  // Analyze each failure
  const analyses = failures
    .map(analyzeFailure)
    .filter((a): a is FailureAnalysis => a !== null);

  // Group by reason type
  const groups = new Map<FailureReasonType, FailureAnalysis[]>();

  analyses.forEach((analysis) => {
    const existing = groups.get(analysis.reasonType) || [];
    groups.set(analysis.reasonType, [...existing, analysis]);
  });

  // Convert to FailureGroup array
  const failureGroups: FailureGroup[] = [];

  groups.forEach((analyses, reasonType) => {
    const description = getReasonTypeDescription(reasonType);
    const tests = analyses.map((a) => a.test);
    const priority = analyses.some((a) => a.priority === "high")
      ? "high"
      : analyses.some((a) => a.priority === "medium")
      ? "medium"
      : "low";

    failureGroups.push({
      reasonType,
      description,
      count: analyses.length,
      tests,
      priority,
    });
  });

  // Sort by priority and count
  return failureGroups.sort((a, b) => {
    // High priority first
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by count
    return b.count - a.count;
  });
}

/**
 * Get human-readable description for failure reason type
 */
function getReasonTypeDescription(reasonType: FailureReasonType): string {
  const descriptions: Record<FailureReasonType, string> = {
    missing_policy_code: "Missing Policy Code Reference",
    wrong_classification: "Wrong Classification",
    low_reasoning_quality: "Low Reasoning Quality",
    no_reasoning: "No Reasoning Provided",
    policy_not_mentioned: "Policy Not Mentioned",
  };

  return descriptions[reasonType];
}

/**
 * Get summary statistics for failures
 */
export function getFailureStats(inferences: InferenceEvent[]) {
  const failures = inferences.filter((inf) => !inf.test_result?.passed);
  const total = failures.length;

  if (total === 0) {
    return {
      total: 0,
      highPriority: 0,
      groups: [],
    };
  }

  const groups = groupFailuresByPattern(inferences);
  const highPriority = groups.filter((g) => g.priority === "high").length;

  return {
    total,
    highPriority,
    groups,
  };
}

/**
 * Get failure reason summary (short text for table display)
 */
export function getFailureReasonSummary(inference: InferenceEvent): string | null {
  const analysis = analyzeFailure(inference);
  if (!analysis) return null;

  // Return concise primary reason
  return analysis.primaryReason;
}

/**
 * Enhanced failure pattern grouping with visual data for dashboards
 */

/**
 * Get color scheme for failure reason types
 */
function getReasonTypeColor(reasonType: FailureReasonType): string {
  // Using hsl() format to work with CSS variables
  const colors: Record<FailureReasonType, string> = {
    missing_policy_code: "hsl(var(--status-error))",
    no_reasoning: "hsl(var(--status-error))",
    low_reasoning_quality: "hsl(var(--status-warning))",
    policy_not_mentioned: "hsl(var(--status-warning))",
    wrong_classification: "hsl(var(--status-info))",
  };

  return colors[reasonType];
}

/**
 * Generate actionable recommendations for a failure group
 */
function generateRecommendations(
  reasonType: FailureReasonType,
  analyses: FailureAnalysis[]
): ActionableRecommendation[] {
  const recommendations: ActionableRecommendation[] = [];

  switch (reasonType) {
    case "missing_policy_code":
      // Collect all missing policy codes
      const allMissingCodes = analyses
        .flatMap(a => a.missingPolicyCodes || [])
        .filter((code, index, self) => self.indexOf(code) === index);

      recommendations.push({
        title: "Add policy code references to prompts",
        description: `${analyses.length} tests failed due to missing policy codes: ${allMissingCodes.join(", ")}. Review and update the system prompt to include these specific policy codes.`,
        priority: "high",
        estimatedImpact: `Could fix ${analyses.length} tests (${((analyses.length / analyses.length) * 100).toFixed(0)}% of this failure type)`,
        actionType: "fix_prompt",
        affectedTests: analyses.length,
      });
      break;

    case "no_reasoning":
      recommendations.push({
        title: "Enable reasoning in model configuration",
        description: `${analyses.length} tests failed without providing any reasoning. Check if the model is configured to output reasoning or if the prompt needs adjustment.`,
        priority: "high",
        estimatedImpact: `Critical - affects ${analyses.length} tests`,
        actionType: "fix_prompt",
        affectedTests: analyses.length,
      });
      break;

    case "low_reasoning_quality":
      const avgQuality = analyses.reduce((sum, a) => {
        return sum + (a.test.reasoning_validation?.quality_score || 0);
      }, 0) / analyses.length;

      recommendations.push({
        title: "Improve reasoning quality",
        description: `${analyses.length} tests have low reasoning quality (avg score: ${avgQuality.toFixed(0)}/100). Consider adding more specific guidance in the system prompt about what constitutes good reasoning.`,
        priority: "medium",
        estimatedImpact: `May improve accuracy on ${analyses.length} tests`,
        actionType: "fix_prompt",
        affectedTests: analyses.length,
      });
      break;

    case "policy_not_mentioned":
      recommendations.push({
        title: "Emphasize policy references in prompt",
        description: `${analyses.length} tests failed because the policy wasn't mentioned in reasoning. Add explicit instruction to reference the policy in all decisions.`,
        priority: "high",
        estimatedImpact: `Could fix ${Math.floor(analyses.length * 0.7)} tests`,
        actionType: "fix_prompt",
        affectedTests: analyses.length,
      });
      break;

    case "wrong_classification":
      // Analyze which classifications are being confused
      const confusionPairs = analyses.map(a => ({
        expected: a.expectedClassification,
        actual: a.actualClassification,
      }));

      const mostCommonConfusion = confusionPairs.reduce((acc, pair) => {
        const key = `${pair.expected} → ${pair.actual}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topConfusion = Object.entries(mostCommonConfusion)
        .sort((a, b) => b[1] - a[1])[0];

      recommendations.push({
        title: "Review classification boundaries",
        description: `${analyses.length} tests have wrong classifications. Most common: ${topConfusion[0]} (${topConfusion[1]} cases). Review if policy definitions are clear enough.`,
        priority: "medium",
        estimatedImpact: `Understanding root cause could improve ${analyses.length} tests`,
        actionType: "review_policy",
        affectedTests: analyses.length,
      });
      break;
  }

  return recommendations;
}

/**
 * Create enhanced failure pattern groups with visual data and recommendations
 */
export function createFailurePatternGroups(inferences: InferenceEvent[], strictPolicyValidation: boolean = true): FailurePatternGroup[] {
  // Filter to only failed tests
  const failures = inferences.filter((inf) => !inf.test_result?.passed);
  if (failures.length === 0) return [];

  // Analyze each failure
  const analyses = failures
    .map((inf) => analyzeFailure(inf, strictPolicyValidation))
    .filter((a): a is FailureAnalysis => a !== null);

  // Group by reason type
  const groups = new Map<FailureReasonType, FailureAnalysis[]>();

  analyses.forEach((analysis) => {
    const existing = groups.get(analysis.reasonType) || [];
    groups.set(analysis.reasonType, [...existing, analysis]);
  });

  // Convert to enhanced FailurePatternGroup array
  const failureGroups: FailurePatternGroup[] = [];

  groups.forEach((groupAnalyses, reasonType) => {
    const tests = groupAnalyses.map((a) => a.test);
    const priority = groupAnalyses.some((a) => a.priority === "high")
      ? "high"
      : groupAnalyses.some((a) => a.priority === "medium")
      ? "medium"
      : "low";

    // Calculate average cost and latency for this group
    const avgCost = tests.reduce((sum, t) => {
      const cost = t.cost_usd ?? t.metrics?.cost_usd ?? 0;
      return sum + cost;
    }, 0) / tests.length;

    const avgLatency = tests.reduce((sum, t) => {
      const latency = t.latency_ms ?? t.metrics?.latency_ms ?? 0;
      return sum + latency;
    }, 0) / tests.length;

    // Collect missing policy codes if applicable
    const missingPolicyCodes = reasonType === "missing_policy_code"
      ? groupAnalyses
          .flatMap(a => a.missingPolicyCodes || [])
          .filter((code, index, self) => self.indexOf(code) === index)
      : undefined;

    failureGroups.push({
      reasonType,
      displayName: getReasonTypeDescription(reasonType),
      description: `${groupAnalyses.length} tests failed due to ${getReasonTypeDescription(reasonType).toLowerCase()}`,
      count: groupAnalyses.length,
      percentage: (groupAnalyses.length / failures.length) * 100,
      tests,
      priority,
      recommendations: generateRecommendations(reasonType, groupAnalyses),
      missingPolicyCodes,
      avgCost,
      avgLatency,
    });
  });

  // Sort by priority and count
  return failureGroups.sort((a, b) => {
    // High priority first
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by count
    return b.count - a.count;
  });
}

/**
 * Create failure distribution data for charts
 */
export function createFailureDistribution(inferences: InferenceEvent[], strictPolicyValidation: boolean = true): FailureDistribution {
  const failures = inferences.filter((inf) => !inf.test_result?.passed);
  const totalFailures = failures.length;

  if (totalFailures === 0) {
    return {
      byReason: [],
      byCategory: [],
      totalFailures: 0,
    };
  }

  // Distribution by reason type with predominant category tracking
  const patternGroups = createFailurePatternGroups(inferences, strictPolicyValidation);
  const byReason: FailureReasonDistribution[] = patternGroups.map(group => {
    // Find the predominant category for this failure reason
    const categoryCount = new Map<string, number>();
    group.tests.forEach(test => {
      const category = test.category || 'unknown';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    // Get the category with the most occurrences
    let predominantCategory = 'unknown';
    let maxCount = 0;
    categoryCount.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        predominantCategory = category;
      }
    });

    return {
      reasonType: group.reasonType,
      displayName: group.displayName,
      count: group.count,
      percentage: group.percentage,
      color: getReasonTypeColor(group.reasonType),
      category: predominantCategory, // Add category for brand color mapping
    };
  });

  // Distribution by category (composite category-test_type key)
  const byCategory: CategoryFailureDistribution[] = [];
  const categoryMap = new Map<string, InferenceEvent[]>();

  inferences.forEach(inf => {
    const testType = inf.test_type || 'baseline';
    const categoryLabel = inf.category || 'unknown';
    const compositeCategory = `${categoryLabel}-${testType}`;

    const existing = categoryMap.get(compositeCategory) || [];
    categoryMap.set(compositeCategory, [...existing, inf]);
  });

  categoryMap.forEach((tests, category) => {
    const failed = tests.filter(t => !t.test_result?.passed);
    const passed = tests.filter(t => t.test_result?.passed);

    // Find top failure reason for this category
    const failedTests = tests.filter(t => !t.test_result?.passed);
    const failureAnalyses = failedTests
      .map((inf) => analyzeFailure(inf, strictPolicyValidation))
      .filter((a): a is FailureAnalysis => a !== null);

    const reasonCounts = new Map<FailureReasonType, number>();
    failureAnalyses.forEach(a => {
      reasonCounts.set(a.reasonType, (reasonCounts.get(a.reasonType) || 0) + 1);
    });

    const topReason = reasonCounts.size > 0
      ? Array.from(reasonCounts.entries())
          .sort((a, b) => b[1] - a[1])[0][0]
      : null;

    byCategory.push({
      category,
      total: tests.length,
      failed: failed.length,
      passed: passed.length,
      failureRate: (failed.length / tests.length) * 100,
      topFailureReason: topReason,
    });
  });

  // Sort by failure rate descending
  byCategory.sort((a, b) => b.failureRate - a.failureRate);

  return {
    byReason,
    byCategory,
    totalFailures,
  };
}
