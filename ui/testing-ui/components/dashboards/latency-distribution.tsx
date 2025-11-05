"use client";

/**
 * Latency Distribution Histogram
 * Shows latency distribution with P50/P95/P99 lines and SLA zones
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Activity, AlertTriangle } from "lucide-react";
import type { LatencyDistribution, SLACompliance } from "@/types/analytics";
import { useState } from "react";

// Helper to get CSS variable values
function getCSSVar(varName: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return `var(${varName})`;
}

export interface LatencyDistributionChartProps {
  distribution: LatencyDistribution;
  slaCompliance?: SLACompliance | null;
  onSLAThresholdChange?: (threshold: number) => void;
  className?: string;
}

export function LatencyDistributionChart({
  distribution,
  slaCompliance,
  onSLAThresholdChange,
  className,
}: LatencyDistributionChartProps) {
  const [slaThreshold, setSLAThreshold] = useState(slaCompliance?.threshold || 1000);

  const handleSLAChange = (value: number) => {
    setSLAThreshold(value);
    onSLAThresholdChange?.(value);
  };

  // Determine bar colors based on SLA zones
  const getBinColor = (rangeEnd: number) => {
    // Get CSS variable values
    const getSLAColor = (varName: string) => {
      if (typeof window !== 'undefined') {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      }
      return `var(${varName})`;
    };

    if (!slaThreshold) return getSLAColor('--sla-good');
    if (rangeEnd <= slaThreshold * 0.7) return getSLAColor('--sla-excellent');
    if (rangeEnd <= slaThreshold) return getSLAColor('--sla-good');
    if (rangeEnd <= slaThreshold * 1.2) return getSLAColor('--sla-warning');
    return getSLAColor('--sla-critical');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{data.label}</div>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tests:</span>
                <span className="font-medium">{data.count}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Percentage:</span>
                <span className="font-medium">{data.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Latency Distribution
            </CardTitle>
            <CardDescription>
              Response time distribution with percentile markers
            </CardDescription>
          </div>
          {slaCompliance && (
            <div className="text-right">
              <div className="text-2xl font-bold">
                {slaCompliance.compliancePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">SLA Compliance</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* SLA Threshold Input */}
        {onSLAThresholdChange && (
          <div className="flex items-end gap-4 pb-4 border-b">
            <div className="flex-1 space-y-2">
              <Label htmlFor="sla-threshold">SLA Threshold (ms)</Label>
              <Input
                id="sla-threshold"
                type="number"
                value={slaThreshold}
                onChange={(e) => handleSLAChange(parseInt(e.target.value) || 1000)}
                className="max-w-xs"
              />
            </div>
            {slaCompliance && (
              <Badge
                variant={
                  slaCompliance.compliancePercentage >= 95
                    ? "default"
                    : slaCompliance.compliancePercentage >= 90
                    ? "secondary"
                    : "destructive"
                }
                className="mb-2"
              >
                {slaCompliance.testsViolatingSLA} violations
              </Badge>
            )}
          </div>
        )}

        {/* Histogram */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={distribution.bins} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
              label={{
                value: "Latency Range (ms)",
                position: "insideBottom",
                offset: -15,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              label={{
                value: "Number of Tests",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Percentile Reference Lines */}
            <ReferenceLine
              x={distribution.bins.findIndex(b => b.rangeEnd >= distribution.p50Line)}
              stroke={getCSSVar('--sla-excellent')}
              strokeDasharray="3 3"
              label={{
                value: `P50: ${Math.round(distribution.p50Line)}ms`,
                position: "top",
                style: { fontSize: 10, fill: getCSSVar('--sla-excellent') },
              }}
            />
            <ReferenceLine
              x={distribution.bins.findIndex(b => b.rangeEnd >= distribution.p95Line)}
              stroke={getCSSVar('--sla-warning')}
              strokeDasharray="3 3"
              label={{
                value: `P95: ${Math.round(distribution.p95Line)}ms`,
                position: "top",
                style: { fontSize: 10, fill: getCSSVar('--sla-warning') },
              }}
            />
            <ReferenceLine
              x={distribution.bins.findIndex(b => b.rangeEnd >= distribution.p99Line)}
              stroke={getCSSVar('--sla-critical')}
              strokeDasharray="3 3"
              label={{
                value: `P99: ${Math.round(distribution.p99Line)}ms`,
                position: "top",
                style: { fontSize: 10, fill: getCSSVar('--sla-critical') },
              }}
            />

            {/* SLA Threshold Line */}
            {distribution.slaThreshold && (
              <ReferenceLine
                x={distribution.bins.findIndex(b => b.rangeEnd >= distribution.slaThreshold!)}
                stroke={getCSSVar('--chart-3')}
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `SLA: ${distribution.slaThreshold}ms`,
                  position: "top",
                  style: { fontSize: 11, fill: getCSSVar('--chart-3'), fontWeight: "bold" },
                }}
              />
            )}

            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distribution.bins.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBinColor(entry.rangeEnd)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* SLA Zones Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[color:var(--sla-excellent)]" />
            <span className="text-muted-foreground">
              Excellent (&lt;{slaThreshold ? Math.round(slaThreshold * 0.7) : 700}ms)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[color:var(--sla-good)]" />
            <span className="text-muted-foreground">
              Good (&lt;{slaThreshold}ms)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[color:var(--sla-warning)]" />
            <span className="text-muted-foreground">
              Warning (&lt;{slaThreshold ? Math.round(slaThreshold * 1.2) : 1200}ms)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[color:var(--sla-critical)]" />
            <span className="text-muted-foreground">
              Critical (&gt;{slaThreshold ? Math.round(slaThreshold * 1.2) : 1200}ms)
            </span>
          </div>
        </div>

        {/* SLA Violations Alert */}
        {slaCompliance && slaCompliance.testsViolatingSLA > 0 && (
          <div className="rounded-lg border border-[color:var(--status-error)] bg-[color:var(--status-error-bg)] p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-[color:var(--status-error)] mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-semibold text-[color:var(--status-error)]">
                  {slaCompliance.testsViolatingSLA} SLA Violations
                </div>
                <div className="text-[color:var(--status-error)] text-xs mt-1 opacity-90">
                  {slaCompliance.testsViolatingSLA} tests exceeded the {slaCompliance.threshold}ms threshold
                  by an average of {Math.round(slaCompliance.avgViolationAmount)}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
