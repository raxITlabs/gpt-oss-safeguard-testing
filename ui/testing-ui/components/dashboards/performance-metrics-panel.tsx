"use client";

/**
 * Performance Metrics Panel
 * Large metric cards displaying P50/P95/P99 latency and key performance indicators
 */

import { MetricCard } from "@/components/metric-card-enhanced";
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
      {/* Primary Percentile Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          size="large"
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
          size="large"
        />

        <MetricCard
          title="P99 Latency"
          value={`${Math.round(latency.p99)}ms`}
          variant={
            latency.p99 <= slaThreshold * 0.7
              ? "success"
              : latency.p99 <= slaThreshold
              ? "default"
              : latency.p99 <= slaThreshold * 1.5
              ? "warning"
              : "destructive"
          }
          trend={{
            direction: latency.p99 <= slaThreshold * 1.5 ? "down" : "up",
            value: `${Math.round(latency.p99)}ms`,
            label:
              latency.p99 <= slaThreshold * 0.7
                ? "Excellent"
                : latency.p99 <= slaThreshold
                ? "Good"
                : latency.p99 <= slaThreshold * 1.5
                ? "Acceptable"
                : "Critical",
          }}
          footer={{
            primary: "Worst-case scenario for most users",
            secondary: "99% of requests",
          }}
          size="large"
        />
      </div>

      {/* Latency Statistics */}
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
          title="Minimum Latency"
          value={`${Math.round(latency.min)}ms`}
          variant="success"
          footer={{
            primary: "Best case",
            secondary: "Fastest test response"
          }}
        />

        <MetricCard
          title="Maximum Latency"
          value={`${Math.round(latency.max)}ms`}
          variant={latency.max > slaThreshold * 2 ? "destructive" : "warning"}
          footer={{
            primary: "Worst case",
            secondary: "Slowest test response"
          }}
        />

        <MetricCard
          title="Latency Range"
          value={`${Math.round(latency.max - latency.min)}ms`}
          footer={{
            primary: "Spread",
            secondary: `Min: ${Math.round(latency.min)}ms, Max: ${Math.round(latency.max)}ms`
          }}
        />
      </div>

      {/* SLA Compliance */}
      {sla && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            size="large"
          />

          <MetricCard
            title="Tests Within SLA"
            value={sla.testsWithinSLA}
            variant="success"
            footer={{
              primary: "Passing tests",
              secondary: `${((sla.testsWithinSLA / (sla.testsWithinSLA + sla.testsViolatingSLA)) * 100).toFixed(1)}% of total`,
            }}
          />

          <MetricCard
            title="SLA Violations"
            value={sla.testsViolatingSLA}
            variant={sla.testsViolatingSLA === 0 ? "success" : "destructive"}
            footer={{
              primary: sla.testsViolatingSLA === 0 ? "No violations" : "Failed tests",
              secondary: `${((sla.testsViolatingSLA / (sla.testsWithinSLA + sla.testsViolatingSLA)) * 100).toFixed(1)}% of total`,
            }}
          />

          <MetricCard
            title="Avg Violation Amount"
            value={`+${Math.round(sla.avgViolationAmount)}ms`}
            variant={sla.avgViolationAmount > 500 ? "destructive" : "warning"}
            footer={{
              primary: "Over threshold",
              secondary: sla.testsViolatingSLA > 0 ? "Per violation" : "No violations",
            }}
          />
        </div>
      )}

      {/* Extreme Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title={`Fastest Test (#${fastestTest.testNumber})`}
          value={`${Math.round(fastestTest.latency)}ms`}
          variant="success"
          footer={{
            primary: fastestTest.testName ?? "Unknown test",
            secondary: `${fastestTest.category} • ${fastestTest.tokens} tokens • $${fastestTest.cost.toFixed(6)}`,
          }}
          size="large"
        />

        <MetricCard
          title={`Slowest Test (#${slowestTest.testNumber})`}
          value={`${Math.round(slowestTest.latency)}ms`}
          variant="destructive"
          footer={{
            primary: slowestTest.testName ?? "Unknown test",
            secondary: `${slowestTest.category} • ${slowestTest.tokens} tokens • $${slowestTest.cost.toFixed(6)}`,
          }}
          size="large"
        />
      </div>

      {/* Performance Outliers */}
      {latency.outliers.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Performance Outliers</h3>
            <p className="text-sm text-muted-foreground">
              Tests significantly slower than average ({latency.outliers.length} detected)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latency.outliers.slice(0, 6).map((outlier, index) => (
              <MetricCard
                key={`${outlier.testNumber}-${outlier.testName}-${index}`}
                title={`Test #${outlier.testNumber}`}
                value={`${Math.round(outlier.latency)}ms`}
                variant={outlier.passed ? "warning" : "destructive"}
                trend={{
                  direction: "up",
                  value: `+${Math.round(outlier.deviationFromMean)}ms`,
                  label: "Above average",
                }}
                footer={{
                  primary: outlier.testName ?? "Unknown test",
                  secondary: `${outlier.category} • ${outlier.tokens} tokens • $${outlier.cost.toFixed(6)}`,
                }}
                onClick={() => onOutlierClick?.(outlier)}
              />
            ))}
          </div>
          {latency.outliers.length > 6 && (
            <p className="text-center text-sm text-muted-foreground">
              +{latency.outliers.length - 6} more outliers not shown
            </p>
          )}
        </div>
      )}
    </div>
  );
}
