"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { InferenceEvent, TestCategory, TestType } from "@/types/test-results";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { Info } from "lucide-react";

interface TestContextProps {
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
}

interface NarrativeMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  categoryStats: Array<{
    category: string;
    total: number;
    passed: number;
    failed: number;
    failureRate: number;
  }>;
  testTypeStats: Array<{
    testType: string;
    total: number;
    passed: number;
    failed: number;
    failureRate: number;
  }>;
  avgLatency: number;
  totalCost: number;
  avgCost: number;
  mostProblematicCategory?: string;
  mostProblematicTestType?: string;
  worstCategoryFailureRate?: number;
  worstTestTypeFailureRate?: number;
}

function calculateNarrativeMetrics(inferences: InferenceEvent[], strictPolicyValidation: boolean = true): NarrativeMetrics {
  const totalTests = inferences.length;
  if (totalTests === 0) {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0,
      categoryStats: [],
      testTypeStats: [],
      avgLatency: 0,
      totalCost: 0,
      avgCost: 0,
    };
  }

  // Calculate pass/fail
  const passedTests = inferences.filter(inf => analyzeFailure(inf, strictPolicyValidation) === null);
  const failedTests = inferences.filter(inf => analyzeFailure(inf, strictPolicyValidation) !== null);
  const passRate = (passedTests.length / totalTests) * 100;

  // Group by category
  const categoryGroups = inferences.reduce((acc, inf) => {
    const cat = inf.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  const categoryStats = Object.entries(categoryGroups).map(([category, tests]) => {
    const passed = tests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length;
    const failed = tests.length - passed;
    return {
      category,
      total: tests.length,
      passed,
      failed,
      failureRate: (failed / tests.length) * 100,
    };
  }).sort((a, b) => b.failureRate - a.failureRate);

  // Group by test type
  const testTypeGroups = inferences.reduce((acc, inf) => {
    const type = inf.test_type || "baseline";
    if (!acc[type]) acc[type] = [];
    acc[type].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  const testTypeStats = Object.entries(testTypeGroups).map(([testType, tests]) => {
    const passed = tests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length;
    const failed = tests.length - passed;
    return {
      testType,
      total: tests.length,
      passed,
      failed,
      failureRate: (failed / tests.length) * 100,
    };
  }).sort((a, b) => b.failureRate - a.failureRate);

  // Performance metrics
  const totalLatency = inferences.reduce((sum, inf) => sum + (inf.latency_ms ?? inf.metrics?.latency_ms ?? 0), 0);
  const totalCost = inferences.reduce((sum, inf) => sum + (inf.cost_usd ?? inf.metrics?.cost_usd ?? 0), 0);

  return {
    totalTests,
    passedTests: passedTests.length,
    failedTests: failedTests.length,
    passRate,
    categoryStats,
    testTypeStats,
    avgLatency: totalLatency / totalTests,
    totalCost,
    avgCost: totalCost / totalTests,
    mostProblematicCategory: categoryStats[0]?.category,
    mostProblematicTestType: testTypeStats[0]?.testType,
    worstCategoryFailureRate: categoryStats[0]?.failureRate,
    worstTestTypeFailureRate: testTypeStats[0]?.failureRate,
  };
}

function formatCategory(cat: string): string {
  return cat
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTestType(type: string): string {
  return type
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateNarrativeSummary(metrics: NarrativeMetrics, modelName: string, categoryCount: number): string {
  const sentences: string[] = [];

  // Sentence 1: Opening context
  const contextPhrase = categoryCount === 1
    ? `the ${formatCategory(metrics.categoryStats[0]?.category || "unknown")} category`
    : `${categoryCount} policy categories`;

  sentences.push(
    `We put ${modelName} through its paces with ${metrics.totalTests.toLocaleString()} rigorous tests across ${contextPhrase}`
  );

  // Sentence 2: Performance summary with insights
  if (metrics.passRate >= 80) {
    const perfPhrase = metrics.avgLatency > 0
      ? ` while maintaining ${Math.round(metrics.avgLatency)}ms average response times`
      : '';
    sentences.push(
      `achieving an ${metrics.passRate.toFixed(1)}% pass rate${perfPhrase}`
    );
  } else if (metrics.passRate >= 50) {
    const problemPhrase = metrics.worstCategoryFailureRate && metrics.worstCategoryFailureRate > 30 && metrics.mostProblematicCategory
      ? `. ${formatCategory(metrics.mostProblematicCategory)} proved most challenging with ${Math.round(metrics.worstCategoryFailureRate)}% of tests failing`
      : '';
    sentences.push(
      `showing a ${metrics.passRate.toFixed(1)}% pass rate with room for improvement${problemPhrase}`
    );
  } else {
    const problemCategory = metrics.mostProblematicCategory
      ? ` particularly in ${formatCategory(metrics.mostProblematicCategory)} where ${Math.round(metrics.worstCategoryFailureRate || 0)}% of tests failed`
      : '';
    sentences.push(
      `revealing significant challenges with a ${metrics.passRate.toFixed(1)}% pass rate${problemCategory}`
    );
  }

  // Sentence 3: Test methodology insight (if relevant)
  if (metrics.testTypeStats.length > 1 && metrics.worstTestTypeFailureRate && metrics.worstTestTypeFailureRate > 40 && metrics.mostProblematicTestType) {
    sentences.push(
      `${formatTestType(metrics.mostProblematicTestType)} attack scenarios revealed the most vulnerabilities, with ${Math.round(metrics.worstTestTypeFailureRate)}% failure rate`
    );
  }

  // Sentence 4: Cost/efficiency context (if meaningful)
  if (metrics.totalCost > 0.01) {
    sentences.push(
      `Test execution totaled $${metrics.totalCost.toFixed(2)} across all evaluations`
    );
  }

  // Final sentence: Future context
  sentences.push(
    `This baseline establishes our benchmark as we expand testing to additional models for production deployment`
  );

  return sentences.join('. ') + '.';
}

export function DashboardTestContext({ inferences, strictPolicyValidation = true }: TestContextProps) {
  // Extract unique values
  const uniqueModels = [...new Set(
    inferences.map(i => i.request.model || i.response.model).filter(Boolean)
  )];

  const uniqueCategories = [...new Set(
    inferences.map(i => i.category).filter(Boolean)
  )] as TestCategory[];

  const uniqueTestTypes = [...new Set(
    inferences.map(i => i.test_type).filter(Boolean)
  )] as TestType[];

  // Calculate narrative metrics
  const metrics = calculateNarrativeMetrics(inferences, strictPolicyValidation);

  // Generate dynamic narrative summary
  const modelName = uniqueModels.length === 1 ? uniqueModels[0] : uniqueModels[0] || "the model";
  const narrativeSummary = generateNarrativeSummary(metrics, modelName, uniqueCategories.length);

  return (
    <div className="space-y-6">
      {/* TLDR Summary */}
      <div>
        <div className="flex items-start gap-3 mb-4">
          {/* <Info className="size-5 text-primary shrink-0 mt-0.5" /> */}
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
              TL;DR
              {/* <InfoTooltip content="Executive summary of test run performance, coverage, and key findings" /> */}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {narrativeSummary.split(modelName).map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && <strong className="font-semibold text-foreground">{modelName}</strong>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

        {/* Divider */}
        <div className="border-t border-border/40 my-5" />

        {/* Interactive Filters - Click to explore */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            Click any badge below to view detailed results or filter the results by model, category, or test type.
          </p>
        </div>

        {/* Detailed Lists */}
        <div className="space-y-4">
          {/* Models */}
          {uniqueModels.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Models <span className="text-foreground/70">({uniqueModels.length})</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {uniqueModels.map((model) => {
                  const modelTests = inferences.filter(
                    i => (i.request.model || i.response.model) === model
                  );
                  return (
                    <Link
                      key={model}
                      href={`/model/${encodeURIComponent(model)}`}
                      className="group"
                    >
                      <Badge
                        variant="outline"
                        className="hover:border-[color:var(--chart-1)] hover:bg-[color:var(--chart-1)]/10 transition-colors cursor-pointer"
                      >
                        {model}
                        <span className="ml-1.5 text-[10px] text-muted-foreground group-hover:text-foreground">
                          ({modelTests.length})
                        </span>
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categories */}
          {uniqueCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Policy Categories <span className="text-foreground/70">({uniqueCategories.length})</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {uniqueCategories.map((category) => {
                  const categoryTests = inferences.filter(i => i.category === category);
                  return (
                    <Link
                      key={category}
                      href={`/policy/${category}`}
                      className="group"
                    >
                      <Badge
                        variant="outline"
                        className="hover:border-[color:var(--chart-2)] hover:bg-[color:var(--chart-2)]/10 transition-colors cursor-pointer"
                      >
                        {formatCategory(category)}
                        <span className="ml-1.5 text-[10px] text-muted-foreground group-hover:text-foreground">
                          ({categoryTests.length})
                        </span>
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Test Types */}
          {uniqueTestTypes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Test Methodologies <span className="text-foreground/70">({uniqueTestTypes.length})</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {uniqueTestTypes.map((testType) => {
                  const typeTests = inferences.filter(i => i.test_type === testType);
                  const urlTestType = testType.replace(/_/g, "-");
                  return (
                    <Link
                      key={testType}
                      href={`/method/${urlTestType}`}
                      className="group"
                    >
                      <Badge
                        variant="outline"
                        className="hover:border-[color:var(--chart-3)] hover:bg-[color:var(--chart-3)]/10 transition-colors cursor-pointer"
                      >
                        {formatTestType(testType)}
                        <span className="ml-1.5 text-[10px] text-muted-foreground group-hover:text-foreground">
                          ({typeTests.length})
                        </span>
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
