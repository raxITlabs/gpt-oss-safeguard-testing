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

      {/* Latency Statistics & SLA Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latency Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Latency Statistics</CardTitle>
            <CardDescription>Additional performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Average Latency</span>
                </div>
                <div className="text-2xl font-bold text-foreground">{Math.round(latency.mean)}ms</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Minimum Latency</span>
                  <Badge variant="outline" className="text-xs">Best case</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[color:var(--status-success)] shrink-0" />
                  <div className="text-2xl font-bold text-foreground">{Math.round(latency.min)}ms</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Maximum Latency</span>
                  <Badge 
                    variant={latency.max > slaThreshold * 2 ? "destructive" : "secondary"} 
                    className="text-xs"
                  >
                    Worst case
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    latency.max > slaThreshold * 2 
                      ? "bg-[color:var(--status-error)]" 
                      : "bg-[color:var(--status-warning)]"
                  }`} />
                  <div className="text-2xl font-bold text-foreground">{Math.round(latency.max)}ms</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Latency Range</div>
                <div className="text-2xl font-bold text-foreground">{Math.round(latency.max - latency.min)}ms</div>
                <div className="text-xs text-muted-foreground">Spread</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance Card */}
        {sla && (
          <Card className={
            sla.compliancePercentage >= 95
              ? "border-[color:var(--status-success)]"
              : sla.compliancePercentage >= 90
              ? "border-[color:var(--status-info)]"
              : "border-[color:var(--status-error)]"
          }>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SLA Compliance</CardTitle>
                  <CardDescription className="mt-1">Target: {sla.threshold}ms response time</CardDescription>
                </div>
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
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Within SLA</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[color:var(--status-success)] shrink-0" />
                    <div className="text-xl font-bold text-foreground">
                      {sla.testsWithinSLA}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">tests</div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Violations</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[color:var(--status-error)] shrink-0" />
                    <div className="text-xl font-bold text-foreground">
                      {sla.testsViolatingSLA}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">tests</div>
                </div>

                <div>
                  <div className="text-muted-foreground mb-1 text-xs">Avg Violation</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[color:var(--status-warning)] shrink-0" />
                    <div className="text-xl font-bold text-foreground">
                      +{Math.round(sla.avgViolationAmount)}ms
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">over threshold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Extreme Values */}
      <Card>
        <CardHeader>
          <CardTitle>Extreme Values</CardTitle>
          <CardDescription>Fastest and slowest test performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fastest Test */}
            <div className="space-y-3 border-r-0 md:border-r md:pr-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[color:var(--status-success)]" />
                <CardTitle className="text-base text-foreground">Fastest Test</CardTitle>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{fastestTest.testName}</span>
                  <Badge variant="outline">#{fastestTest.testNumber}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[color:var(--status-success)] shrink-0" />
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(fastestTest.latency)}ms
                  </div>
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
            </div>

            {/* Slowest Test */}
            <div className="space-y-3 md:pl-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[color:var(--status-error)]" />
                <CardTitle className="text-base text-foreground">Slowest Test</CardTitle>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{slowestTest.testName}</span>
                  <Badge variant="outline">#{slowestTest.testNumber}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[color:var(--status-error)] shrink-0" />
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round(slowestTest.latency)}ms
                  </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <span className="font-medium text-foreground">{outlier.testName}</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-2 rounded-full bg-[color:var(--status-error)] shrink-0" />
                      <div className="text-xl font-bold text-foreground">
                        {Math.round(outlier.latency)}ms
                      </div>
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
