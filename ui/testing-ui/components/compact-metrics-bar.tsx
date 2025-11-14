"use client";

import type { InferenceEvent, SessionSummary } from "@/types/test-results";
import { formatCurrency, formatLatency } from "@/lib/format-utils";
import { analyzePerformance } from "@/lib/performance-analyzer";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { MetricCard } from "@/components/metric-card-enhanced";

interface CompactMetricsBarProps {
  summary: SessionSummary;
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
}

export function CompactMetricsBar({ summary, inferences, strictPolicyValidation = true }: CompactMetricsBarProps) {
  const perfMetrics = analyzePerformance(inferences);

  // Recalculate pass/fail based on strictPolicyValidation setting
  let passed = 0;
  let failed = 0;

  inferences.forEach(inf => {
    const analysis = analyzeFailure(inf, strictPolicyValidation);
    if (analysis === null) {
      passed++;
    } else {
      failed++;
    }
  });

  const passRate = inferences.length > 0 ? (passed / inferences.length) * 100 : 0;

  const getPassRateStatus = (rate: number) => {
    if (rate >= 90) return { label: "Excellent", variant: "success" as const };
    if (rate >= 70) return { label: "Good", variant: "default" as const };
    return { label: "Needs Attention", variant: "warning" as const };
  };

  const status = getPassRateStatus(passRate);

  // Calculate performance trend (simplified)
  const isGoodPerformance = perfMetrics.avgLatency < 1000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Pass Rate"
        value={`${passRate.toFixed(1)}%`}
        variant={status.variant}
        trend={{
          direction: passRate >= 70 ? "up" : "down",
          value: `${passRate.toFixed(1)}%`,
          label: status.label,
        }}
        footer={{
          primary: passRate >= 90 ? "Strong performance" : passRate >= 70 ? "Good progress" : "Review failures",
          secondary: `${passed} of ${inferences.length} tests passed`,
        }}
      />

      <MetricCard
        title="Avg Latency"
        value={formatLatency(perfMetrics.avgLatency)}
        variant={isGoodPerformance ? "success" : "default"}
        trend={{
          direction: isGoodPerformance ? "down" : "up",
          value: formatLatency(perfMetrics.avgLatency),
          label: isGoodPerformance ? "Within SLA" : "Monitor",
        }}
        footer={{
          primary: isGoodPerformance ? "Fast response times" : "Optimization needed",
          secondary: `Range: ${formatLatency(perfMetrics.latencyRange.min)} - ${formatLatency(perfMetrics.latencyRange.max)}`,
        }}
      />

      <MetricCard
        title="Avg Cost"
        value={formatCurrency(perfMetrics.avgCost)}
        footer={{
          primary: "Cost per test",
          secondary: `Total: ${formatCurrency(perfMetrics.totalCost)}`,
        }}
      />

      <MetricCard
        title="Total Tests"
        value={inferences.length}
        footer={{
          primary: "Tests completed",
          secondary: `${perfMetrics.totalTokens.toLocaleString()} tokens used`,
        }}
      />
    </div>
  );
}
