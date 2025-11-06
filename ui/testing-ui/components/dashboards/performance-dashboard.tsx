"use client";

/**
 * Performance Dashboard Container
 * Combines all performance-related visualizations
 */

import { useState, useMemo } from "react";
import { LatencyDistributionChart } from "./latency-distribution";
import { PerformanceMetricsPanel } from "./performance-metrics-panel";
import { LatencyTokensScatter } from "./latency-tokens-scatter";
import type { InferenceEvent } from "@/types/test-results";
import {
  prepareLatencyDistribution,
  calculateSLACompliance,
  generatePerformanceSummary,
  analyzeLatencyTokenCorrelation,
} from "@/lib/latency-analyzer";

export interface PerformanceDashboardProps {
  inferences: InferenceEvent[];
  defaultSLAThreshold?: number;
  onTestClick?: (testNumber: number) => void;
  className?: string;
}

export function PerformanceDashboard({
  inferences,
  defaultSLAThreshold = 1000,
  onTestClick,
  className,
}: PerformanceDashboardProps) {
  const [slaThreshold, setSLAThreshold] = useState(defaultSLAThreshold);

  // Prepare all performance data
  const distribution = useMemo(
    () => prepareLatencyDistribution(inferences, 10),
    [inferences]
  );

  const slaCompliance = useMemo(
    () => calculateSLACompliance(inferences, slaThreshold),
    [inferences, slaThreshold]
  );

  const performanceSummary = useMemo(
    () => generatePerformanceSummary(inferences, slaThreshold),
    [inferences, slaThreshold]
  );

  const latencyTokenCorrelation = useMemo(
    () => analyzeLatencyTokenCorrelation(inferences),
    [inferences]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* All content sections stacked vertically */}
      <PerformanceMetricsPanel
        metrics={performanceSummary}
        slaThreshold={slaThreshold}
        onOutlierClick={(outlier) => onTestClick?.(outlier.testNumber)}
      />

      <LatencyDistributionChart
        distribution={distribution}
        slaCompliance={slaCompliance}
        onSLAThresholdChange={setSLAThreshold}
      />

      <LatencyTokensScatter
        correlation={latencyTokenCorrelation}
        onPointClick={onTestClick}
      />
    </div>
  );
}
