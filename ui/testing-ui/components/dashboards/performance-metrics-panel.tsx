"use client";

/**
 * Performance Metrics Panel
 * Displays 4 primary performance metric cards and detailed tables
 */

import { MetricCard } from "@/components/metric-card-enhanced";
import { LatencyDistributionTable } from "./latency-distribution-table";
import { SLAPerformanceTable } from "./sla-performance-table";
import { ExtremeTestsTable } from "./extreme-tests-table";
import { PerformanceOutliersTable } from "./performance-outliers-table";
import type { PerformanceMetricsSummary, TestOutlier } from "@/types/analytics";

export interface PerformanceMetricsPanelProps {
  metrics: PerformanceMetricsSummary;
  slaThreshold?: number;
  className?: string;
  onOutlierClick?: (outlier: TestOutlier) => void;
}

export function PerformanceMetricsPanel({
  metrics,
  slaThreshold = 1000,
  className,
  onOutlierClick,
}: PerformanceMetricsPanelProps) {
  const { latency, sla, fastestTest, slowestTest } = metrics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Performance Metrics - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Latency"
          value={`${Math.round(latency.mean)}ms`}
          variant={
            latency.mean <= slaThreshold * 0.7
              ? "success"
              : latency.mean <= slaThreshold
              ? "default"
              : latency.mean <= slaThreshold * 1.2
              ? "warning"
              : "destructive"
          }
          footer={{
            primary: "Mean latency",
            secondary: "Across all tests"
          }}
        />

        <MetricCard
          title="P50 Latency (Median)"
          value={`${Math.round(latency.p50)}ms`}
          variant={
            latency.p50 <= slaThreshold * 0.7
              ? "success"
              : latency.p50 <= slaThreshold
              ? "default"
              : latency.p50 <= slaThreshold * 1.2
              ? "warning"
              : "destructive"
          }
          trend={{
            direction: latency.p50 <= slaThreshold ? "down" : "up",
            value: `${Math.round(latency.p50)}ms`,
            label:
              latency.p50 <= slaThreshold * 0.7
                ? "Excellent"
                : latency.p50 <= slaThreshold
                ? "Good"
                : latency.p50 <= slaThreshold * 1.2
                ? "Attention Needed"
                : "Critical",
          }}
          footer={{
            primary: "Half of all tests complete faster than this",
            secondary: "50% of requests (median)",
          }}
        />

        <MetricCard
          title="P95 Latency"
          value={`${Math.round(latency.p95)}ms`}
          variant={
            latency.p95 <= slaThreshold * 0.7
              ? "success"
              : latency.p95 <= slaThreshold
              ? "default"
              : latency.p95 <= slaThreshold * 1.2
              ? "warning"
              : "destructive"
          }
          trend={{
            direction: latency.p95 <= slaThreshold ? "down" : "up",
            value: `${Math.round(latency.p95)}ms`,
            label:
              latency.p95 <= slaThreshold * 0.7
                ? "Excellent"
                : latency.p95 <= slaThreshold
                ? "Good"
                : latency.p95 <= slaThreshold * 1.2
                ? "Attention Needed"
                : "Critical",
          }}
          footer={{
            primary: "Most users experience this or better",
            secondary: "95% of requests",
          }}
        />

        {sla && (
          <MetricCard
            title="SLA Compliance"
            value={`${sla.compliancePercentage.toFixed(1)}%`}
            variant={
              sla.compliancePercentage >= 95
                ? "success"
                : sla.compliancePercentage >= 90
                ? "default"
                : "destructive"
            }
            trend={{
              direction: sla.compliancePercentage >= 95 ? "up" : "down",
              value: `${sla.compliancePercentage.toFixed(1)}%`,
              label: sla.compliancePercentage >= 95 ? "Meeting SLA" : "Below Target",
            }}
            footer={{
              primary: `Target: ${sla.threshold}ms`,
              secondary: `${sla.testsWithinSLA + sla.testsViolatingSLA} total tests`,
            }}
          />
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatencyDistributionTable latency={latency} slaThreshold={slaThreshold} />
        {sla && <SLAPerformanceTable sla={sla} />}
      </div>

      <ExtremeTestsTable fastestTest={fastestTest} slowestTest={slowestTest} />

      {latency.outliers && latency.outliers.length > 0 && (
        <PerformanceOutliersTable
          outliers={latency.outliers}
          onOutlierClick={onOutlierClick}
        />
      )}
    </div>
  );
}
