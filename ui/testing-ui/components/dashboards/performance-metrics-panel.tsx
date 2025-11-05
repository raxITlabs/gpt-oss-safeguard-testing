"use client";

/**
 * Performance Metrics Panel
 * Large metric cards displaying P50/P95/P99 latency and key performance indicators
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap, Clock, TrendingUp } from "lucide-react";
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
  const { latency, sla, fastestTest, slowestTest, categoryPerformance } = metrics;

  // Calculate status for each percentile
  const getLatencyStatus = (value: number): "excellent" | "good" | "warning" | "critical" => {
    if (value <= slaThreshold * 0.7) return "excellent";
    if (value <= slaThreshold) return "good";
    if (value <= slaThreshold * 1.2) return "warning";
    return "critical";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Percentile Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="P50 Latency (Median)"
          value={`${Math.round(latency.p50)}ms`}
          subtitle="50% of requests"
          icon={<Activity className="h-4 w-4" />}
          status={getLatencyStatus(latency.p50)}
          description="Half of all tests complete faster than this"
          size="large"
          threshold={{
            value: slaThreshold,
            comparison: "below",
            met: latency.p50 <= slaThreshold,
          }}
        />

        <MetricCard
          title="P95 Latency"
          value={`${Math.round(latency.p95)}ms`}
          subtitle="95% of requests"
          icon={<Zap className="h-4 w-4" />}
          status={getLatencyStatus(latency.p95)}
          description="Most users experience this or better"
          size="large"
          threshold={{
            value: slaThreshold,
            comparison: "below",
            met: latency.p95 <= slaThreshold,
          }}
        />

        <MetricCard
          title="P99 Latency"
          value={`${Math.round(latency.p99)}ms`}
          subtitle="99% of requests"
          icon={<Clock className="h-4 w-4" />}
          status={getLatencyStatus(latency.p99)}
          description="Worst-case scenario for most users"
          size="large"
          threshold={{
            value: slaThreshold * 1.5,
            comparison: "below",
            met: latency.p99 <= slaThreshold * 1.5,
          }}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Average Latency"
          value={`${Math.round(latency.mean)}ms`}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <MetricCard
          title="Minimum Latency"
          value={`${Math.round(latency.min)}ms`}
          subtitle="Best case"
          status="excellent"
        />

        <MetricCard
          title="Maximum Latency"
          value={`${Math.round(latency.max)}ms`}
          subtitle="Worst case"
          status={latency.max > slaThreshold * 2 ? "critical" : "warning"}
        />

        <MetricCard
          title="Latency Range"
          value={`${Math.round(latency.max - latency.min)}ms`}
          subtitle="Spread"
          description="Difference between fastest and slowest"
        />
      </div>

      {/* SLA Compliance Card */}
      {sla && (
        <Card className={
          sla.compliancePercentage >= 95
            ? "border-[color:var(--status-success)]"
            : sla.compliancePercentage >= 90
            ? "border-[color:var(--status-info)]"
            : "border-[color:var(--status-error)]"
        }>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>SLA Compliance</span>
              <Badge
                variant={
                  sla.compliancePercentage >= 95
                    ? "default"
                    : sla.compliancePercentage >= 90
                    ? "secondary"
                    : "destructive"
                }
                className="text-lg px-3 py-1"
              >
                {sla.compliancePercentage.toFixed(1)}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Target: {sla.threshold}ms response time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Within SLA</div>
                <div className="text-2xl font-bold text-[color:var(--status-success)]">
                  {sla.testsWithinSLA}
                </div>
                <div className="text-xs text-muted-foreground">tests</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Violations</div>
                <div className="text-2xl font-bold text-[color:var(--status-error)]">
                  {sla.testsViolatingSLA}
                </div>
                <div className="text-xs text-muted-foreground">tests</div>
              </div>

              <div>
                <div className="text-muted-foreground mb-1">Avg Violation</div>
                <div className="text-2xl font-bold text-[color:var(--status-warning)]">
                  +{Math.round(sla.avgViolationAmount)}ms
                </div>
                <div className="text-xs text-muted-foreground">over threshold</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extreme Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-[color:var(--status-success)] border-l-4">
          <CardHeader>
            <CardTitle className="text-base">Fastest Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{fastestTest.testName}</span>
                <Badge variant="outline">#{fastestTest.testNumber}</Badge>
              </div>
              <div className="text-3xl font-bold text-[color:var(--status-success)]">
                {Math.round(fastestTest.latency)}ms
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t">
                <div>
                  <div>Category</div>
                  <div className="font-medium text-foreground">{fastestTest.category}</div>
                </div>
                <div>
                  <div>Tokens</div>
                  <div className="font-medium text-foreground">{fastestTest.tokens}</div>
                </div>
                <div>
                  <div>Cost</div>
                  <div className="font-medium text-foreground">${fastestTest.cost.toFixed(6)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--status-error)] border-l-4">
          <CardHeader>
            <CardTitle className="text-base">Slowest Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{slowestTest.testName}</span>
                <Badge variant="outline">#{slowestTest.testNumber}</Badge>
              </div>
              <div className="text-3xl font-bold text-[color:var(--status-error)]">
                {Math.round(slowestTest.latency)}ms
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t">
                <div>
                  <div>Category</div>
                  <div className="font-medium text-foreground">{slowestTest.category}</div>
                </div>
                <div>
                  <div>Tokens</div>
                  <div className="font-medium text-foreground">{slowestTest.tokens}</div>
                </div>
                <div>
                  <div>Cost</div>
                  <div className="font-medium text-foreground">${slowestTest.cost.toFixed(6)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Average and P95 latency across test categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryPerformance.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{cat.category}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Avg: <span className="font-medium text-foreground">{Math.round(cat.avgLatency)}ms</span>
                    </span>
                    <span className="text-muted-foreground">
                      P95: <span className="font-medium text-foreground">{Math.round(cat.p95Latency)}ms</span>
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {cat.testCount} tests
                    </Badge>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full">
                  <div
                    className={`absolute h-2 rounded-full ${
                      cat.p95Latency <= slaThreshold * 0.7
                        ? "bg-[color:var(--status-success)]"
                        : cat.p95Latency <= slaThreshold
                        ? "bg-[color:var(--status-info)]"
                        : cat.p95Latency <= slaThreshold * 1.2
                        ? "bg-[color:var(--status-warning)]"
                        : "bg-[color:var(--status-error)]"
                    }`}
                    style={{ width: `${Math.min((cat.p95Latency / (slaThreshold * 1.5)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outliers */}
      {latency.outliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Outliers</CardTitle>
            <CardDescription>
              Tests significantly slower than average ({latency.outliers.length} detected)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {latency.outliers.slice(0, 5).map((outlier, index) => (
                <div
                  key={`${outlier.testNumber}-${outlier.testName}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => onOutlierClick?.(outlier)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{outlier.testName}</span>
                      <Badge variant="outline">#{outlier.testNumber}</Badge>
                      <Badge variant={outlier.passed ? "default" : "destructive"} className="text-xs">
                        {outlier.passed ? "PASSED" : "FAILED"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {outlier.category} • {outlier.tokens} tokens • ${outlier.cost.toFixed(6)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[color:var(--status-error)]">
                      {Math.round(outlier.latency)}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{Math.round(outlier.deviationFromMean)}ms from avg
                    </div>
                  </div>
                </div>
              ))}
              {latency.outliers.length > 5 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  +{latency.outliers.length - 5} more outliers
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
