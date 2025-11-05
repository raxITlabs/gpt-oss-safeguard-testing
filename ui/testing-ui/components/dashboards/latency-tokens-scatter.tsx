"use client";

/**
 * Latency vs Tokens Scatter Plot
 * Shows correlation between token count and latency
 */

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
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LatencyTokenCorrelation } from "@/types/analytics";
import { CATEGORY_COLORS, getCategoryColor } from "@/lib/constants";

// Helper to get CSS variable values
function getCSSVar(varName: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return `var(${varName})`;
}

export interface LatencyTokensScatterProps {
  correlation: LatencyTokenCorrelation;
  onPointClick?: (testNumber: number) => void;
  className?: string;
}

export function LatencyTokensScatter({
  correlation,
  onPointClick,
  className,
}: LatencyTokensScatterProps) {
  const { dataPoints, correlationCoefficient, trend } = correlation;

  // Prepare chart data
  const chartData = dataPoints.map(point => ({
    ...point,
    color: CATEGORY_COLORS[point.category] || CATEGORY_COLORS["Unknown"],
  }));

  // Calculate trend line
  const avgTokens = dataPoints.reduce((sum, p) => sum + p.tokens, 0) / dataPoints.length;
  const avgLatency = dataPoints.reduce((sum, p) => sum + p.latency, 0) / dataPoints.length;

  // Get unique categories for legend
  const categories = Array.from(new Set(dataPoints.map(p => p.category)));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">{point.testName}</span>
              <Badge variant={point.passed ? "default" : "destructive"}>
                {point.passed ? "PASSED" : "FAILED"}
              </Badge>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tokens:</span>
                <span className="font-medium">{point.tokens}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Latency:</span>
                <span className="font-medium">{Math.round(point.latency)}ms</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium">${point.cost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline" className="text-xs">
                  {point.category}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    if (trend === "positive") return <TrendingUp className="h-4 w-4 text-[color:var(--status-warning)]" />;
    if (trend === "negative") return <TrendingDown className="h-4 w-4 text-[color:var(--status-success)]" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendDescription = () => {
    if (trend === "positive") {
      return "More tokens → Higher latency (typical)";
    } else if (trend === "negative") {
      return "More tokens → Lower latency (unusual)";
    }
    return "No significant correlation detected";
  };

  const getCorrelationStrength = () => {
    const abs = Math.abs(correlationCoefficient);
    if (abs > 0.7) return "Strong";
    if (abs > 0.4) return "Moderate";
    if (abs > 0.2) return "Weak";
    return "Very Weak";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Latency vs Token Count</CardTitle>
            <CardDescription>
              Correlation analysis between token usage and response time
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {getCorrelationStrength()} Correlation
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              r = {correlationCoefficient.toFixed(3)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Correlation Insight */}
        <div className={`rounded-lg border p-3 ${
          trend === "positive"
            ? "border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)]"
            : trend === "negative"
            ? "border-[color:var(--status-info)] bg-[color:var(--status-info-bg)]"
            : "border-border bg-muted/20"
        }`}>
          <div className="flex items-start gap-2">
            {getTrendIcon()}
            <div className="flex-1 text-sm">
              <div className="font-semibold">{getTrendDescription()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {trend === "positive" && (
                  "This is expected. Larger prompts/responses take longer to process."
                )}
                {trend === "negative" && (
                  "Unusual pattern. Investigate why larger requests are faster."
                )}
                {trend === "none" && (
                  "Token count doesn't significantly predict latency. Other factors dominate."
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scatter Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="tokens"
              name="Tokens"
              label={{
                value: "Total Tokens",
                position: "insideBottom",
                offset: -10,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              type="number"
              dataKey="latency"
              name="Latency"
              unit="ms"
              label={{
                value: "Latency (ms)",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />

            {/* Average reference lines */}
            <ReferenceLine
              x={avgTokens}
              stroke={getCSSVar('--muted-foreground')}
              strokeDasharray="3 3"
              label={{
                value: "Avg Tokens",
                position: "top",
                style: { fontSize: 10, fill: getCSSVar('--muted-foreground') },
              }}
            />
            <ReferenceLine
              y={avgLatency}
              stroke={getCSSVar('--muted-foreground')}
              strokeDasharray="3 3"
              label={{
                value: "Avg Latency",
                position: "right",
                style: { fontSize: 10, fill: getCSSVar('--muted-foreground') },
              }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />

            <Scatter
              name="Tests"
              data={chartData}
              onClick={onPointClick ? (data) => onPointClick(data.testNumber) : undefined}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={entry.passed ? 0.8 : 0.6}
                  stroke={entry.passed ? entry.color : getCSSVar('--status-error')}
                  strokeWidth={entry.passed ? 0 : 2}
                  cursor={onPointClick ? "pointer" : "default"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[cat] || CATEGORY_COLORS["Unknown"] }}
              />
              <span className="text-xs text-muted-foreground">{cat}</span>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Average Tokens</div>
            <div className="text-2xl font-bold">{Math.round(avgTokens)}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Average Latency</div>
            <div className="text-2xl font-bold">{Math.round(avgLatency)}ms</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Latency per 1K Tokens</div>
            <div className="text-2xl font-bold">
              {Math.round((avgLatency / avgTokens) * 1000)}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
