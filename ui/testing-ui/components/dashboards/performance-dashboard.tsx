"use client";

/**
 * Performance Dashboard Container
 * Combines all performance-related visualizations
 */

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      {/* Main Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="distribution">Latency Distribution</TabsTrigger>
          <TabsTrigger value="correlation">Token Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-6">
          <PerformanceMetricsPanel
            metrics={performanceSummary}
            slaThreshold={slaThreshold}
            onOutlierClick={(outlier) => onTestClick?.(outlier.testNumber)}
          />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <LatencyDistributionChart
            distribution={distribution}
            slaCompliance={slaCompliance}
            onSLAThresholdChange={setSLAThreshold}
          />
        </TabsContent>

        <TabsContent value="correlation" className="mt-6">
          <LatencyTokensScatter
            correlation={latencyTokenCorrelation}
            onPointClick={onTestClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
