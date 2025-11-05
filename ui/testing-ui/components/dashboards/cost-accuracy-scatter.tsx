/**
 * Cost-Accuracy Scatter Plot
 * Shows cost per test vs accuracy to identify optimal tests (low cost, high accuracy)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";
import type { CostAccuracyPoint } from "@/types/analytics";
import { useMemo } from "react";
import { CATEGORY_COLORS, getCategoryColor, getCategoryDisplayLabel } from "@/lib/constants";

// Helper to get CSS variable values
function getCSSVar(varName: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return `var(${varName})`;
}

export interface CostAccuracyScatterProps {
  data: CostAccuracyPoint[];
  onPointClick?: (point: CostAccuracyPoint) => void;
  className?: string;
}

export function CostAccuracyScatter({
  data,
  onPointClick,
  className,
}: CostAccuracyScatterProps) {
  // Transform data for scatter chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      // Convert accuracy boolean to numeric (1 for pass, 0 for fail)
      accuracyValue: point.accuracy ? 1 : 0,
      // Scale cost to be more visible (multiply by 10000)
      costScaled: point.cost * 10000,
      color: CATEGORY_COLORS[point.category] || CATEGORY_COLORS["Unknown"],
    }));
  }, [data]);

  // Calculate average cost
  const avgCost = useMemo(() => {
    const sum = data.reduce((acc, point) => acc + point.cost, 0);
    return (sum / data.length) * 10000; // Scaled
  }, [data]);

  // Group by category for legend
  const categories = useMemo(() => {
    const categorySet = new Set(data.map(p => p.category));
    return Array.from(categorySet).map(cat => ({
      value: cat,
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS["Unknown"],
    }));
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as (typeof chartData)[0];
      return (
        <Card className="p-3 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">{point.testName}</span>
              <Badge variant={point.accuracy ? "default" : "destructive"}>
                {point.accuracy ? "PASSED" : "FAILED"}
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium">${point.cost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Latency:</span>
                <span className="font-medium">{Math.round(point.latency)}ms</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tokens:</span>
                <span className="font-medium">{point.tokens}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline" className="text-xs">
                  {point.category}
                </Badge>
              </div>
              {!point.accuracy && (
                <div className="mt-2 pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Expected: <span className="font-medium text-foreground">{point.expected}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Actual: <span className="font-medium text-foreground">{point.actual}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  // Quadrant labels
  const passedTests = data.filter(p => p.accuracy).length;
  const failedTests = data.length - passedTests;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Cost-Accuracy Trade-off Matrix</CardTitle>
            <CardDescription>
              Identify optimal tests: low cost + high accuracy (top-left quadrant)
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[color:var(--status-success)]" />
              <span className="text-muted-foreground">{passedTests} passed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[color:var(--status-error)]" />
              <span className="text-muted-foreground">{failedTests} failed</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="costScaled"
              name="Cost"
              unit=""
              label={{
                value: "Cost per Test (×10⁻⁴ $)",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 12 },
              }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis
              type="number"
              dataKey="accuracyValue"
              name="Accuracy"
              domain={[-0.1, 1.1]}
              ticks={[0, 1]}
              label={{
                value: "Test Result",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
              tickFormatter={(value) => (value === 1 ? "Pass" : "Fail")}
            />

            {/* Average cost reference line */}
            <ReferenceLine
              x={avgCost}
              stroke={getCSSVar('--muted-foreground')}
              strokeDasharray="3 3"
              label={{
                value: "Avg Cost",
                position: "top",
                style: { fontSize: 10, fill: getCSSVar('--muted-foreground') },
              }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />

            <Legend
              verticalAlign="top"
              height={36}
              content={({ payload }: any) => (
                <div className="flex flex-wrap items-center justify-center gap-3 pb-4">
                  {categories.map((cat) => (
                    <div key={cat.value} className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-muted-foreground">{cat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />

            <Scatter
              name="Tests"
              data={chartData}
              onClick={onPointClick ? (data) => onPointClick(data) : undefined}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={entry.accuracy ? 0.8 : 0.6}
                  stroke={entry.accuracy ? entry.color : getCSSVar('--status-error')}
                  strokeWidth={entry.accuracy ? 0 : 2}
                  cursor={onPointClick ? "pointer" : "default"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant descriptions */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-[color:var(--zone-ideal)] bg-[color:var(--zone-ideal-bg)] p-3">
            <div className="font-medium text-[color:var(--zone-ideal)]">
              ✓ Ideal Zone (Top-Left)
            </div>
            <div className="text-xs text-[color:var(--zone-ideal)] opacity-80">
              Low cost, high accuracy - deploy immediately
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--zone-premium)] bg-[color:var(--zone-premium-bg)] p-3">
            <div className="font-medium text-[color:var(--zone-premium)]">
              ⚠ Premium Zone (Top-Right)
            </div>
            <div className="text-xs text-[color:var(--zone-premium)] opacity-80">
              High cost, high accuracy - worth it for critical content
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--zone-acceptable)] bg-[color:var(--zone-acceptable-bg)] p-3">
            <div className="font-medium text-[color:var(--zone-acceptable)]">
              → Acceptable Zone (Bottom-Left)
            </div>
            <div className="text-xs text-[color:var(--zone-acceptable)] opacity-80">
              Low cost, low accuracy - okay for low-risk scenarios
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--zone-avoid)] bg-[color:var(--zone-avoid-bg)] p-3">
            <div className="font-medium text-[color:var(--zone-avoid)]">
              ✗ Avoid Zone (Bottom-Right)
            </div>
            <div className="text-xs text-[color:var(--zone-avoid)] opacity-80">
              High cost, low accuracy - unacceptable, don't use
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
