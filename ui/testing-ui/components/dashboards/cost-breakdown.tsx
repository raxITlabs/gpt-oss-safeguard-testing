"use client";

/**
 * Cost Breakdown Visualizations
 * Shows cost distribution by category with pie charts and bar charts
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Award } from "lucide-react";
import type { CategoryCostBreakdown, TokenEconomics } from "@/types/analytics";
import React, { useMemo, useState } from "react";

export interface CostBreakdownProps {
  categoryBreakdown: CategoryCostBreakdown[];
  tokenEconomics: TokenEconomics;
  className?: string;
}

// Get chart colors from CSS variables
function getChartColors(): string[] {
  if (typeof window !== 'undefined') {
    const colors: string[] = [];
    for (let i = 1; i <= 8; i++) {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--chart-${i}`)
        .trim();
      colors.push(color);
    }
    return colors;
  }
  // SSR fallback
  return Array(8).fill('var(--chart-1)');
}

const COLORS = getChartColors();

export function CostBreakdown({ categoryBreakdown, tokenEconomics, className }: CostBreakdownProps) {
  const totalCost = categoryBreakdown.reduce((sum, cat) => sum + cat.totalCost, 0);

  // Dotted background pattern component
  const DottedBackgroundPattern = () => {
    return (
      <pattern
        id="highlighted-pattern-dots"
        x="0"
        y="0"
        width="10"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <circle
          className="dark:text-muted/40 text-muted"
          cx="2"
          cy="2"
          r="1"
          fill="currentColor"
        />
      </pattern>
    );
  };


  // Prepare bar chart data
  const barData = useMemo(() => {
    return categoryBreakdown.map((cat, index) => ({
      category: cat.category,
      avgCost: cat.avgCost * 1000000, // Convert to microdollars for better readability
      totalCost: cat.totalCost,
      costPerCorrect: cat.costPerCorrectTest * 1000000,
      passRate: cat.passRate,
      color: COLORS[index % COLORS.length],
    }));
  }, [categoryBreakdown]);

  // Interactive state for bar chart
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return barData[activeIndex];
  }, [activeIndex, barData]);

  // Create chart config for bar chart
  const barChartConfig = useMemo(() => {
    const config: ChartConfig = {
      avgCost: {
        label: "Average Cost",
      },
    };
    
    categoryBreakdown.forEach((cat, index) => {
      const categoryKey = cat.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
      config[categoryKey] = {
        label: cat.category,
        color: `var(--chart-${(index % 8) + 1})`,
      };
    });
    
    return config;
  }, [categoryBreakdown]);

  // Sort by total cost for the table
  const sortedByTotalCost = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.totalCost - a.totalCost);
  }, [categoryBreakdown]);


  // Get bar chart insights (highest and lowest average cost)
  const barChartInsights = useMemo(() => {
    if (barData.length === 0) return null;
    const sortedByAvgCost = [...barData].sort((a, b) => b.avgCost - a.avgCost);
    const highest = sortedByAvgCost[0];
    const lowest = sortedByAvgCost[sortedByAvgCost.length - 1];
    return {
      highest: {
        category: highest.category,
        cost: highest.avgCost / 1000000,
      },
      lowest: {
        category: lowest.category,
        cost: lowest.avgCost / 1000000,
      },
    };
  }, [barData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-3 shadow-lg">
          <div className="space-y-1">
            <div className="font-semibold text-sm">{data.name || data.category}</div>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">${(data.value || data.totalCost).toFixed(6)}</span>
              </div>
              {data.percentage !== undefined && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Percentage:</span>
                  <span className="font-medium">{data.percentage.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Cost"
          value={`$${totalCost.toFixed(6)}`}
          subtitle={`Across ${categoryBreakdown.length} categories`}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <MetricCard
          title="Most Expensive Category"
          value={sortedByTotalCost[0]?.category || "N/A"}
          subtitle={`$${sortedByTotalCost[0]?.totalCost.toFixed(6)} total`}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <MetricCard
          title="Best Value Category"
          value={
            [...categoryBreakdown]
              .filter(c => c.passRate > 80)
              .sort((a, b) => a.costPerCorrectTest - b.costPerCorrectTest)[0]?.category || "N/A"
          }
          subtitle="Low cost + high accuracy"
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bar Chart - Average Cost */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Average Cost per Test</CardTitle>
            <CardDescription>
              {activeData
                ? `${activeData.category}: $${(activeData.avgCost / 1000000).toFixed(6)}`
                : "Cost comparison across categories"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={barChartConfig}>
              <BarChart
                accessibilityLayer
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="85%"
                  fill="url(#highlighted-pattern-dots)"
                />
                <defs>
                  <DottedBackgroundPattern />
                </defs>
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  label={{
                    value: "Cost (µ$)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      nameKey="category"
                      formatter={(value, name, item) => {
                        const categoryName = item?.payload?.category || name || "Unknown";
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{categoryName}:</span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              ${(Number(value) / 1000000).toFixed(6)}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey="avgCost" radius={4}>
                  {barData.map((entry, index) => {
                    const categoryKey = entry.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
                    return (
                      <Cell
                        className="duration-200"
                        key={`cell-${index}`}
                        fill={`var(--color-${categoryKey})`}
                        fillOpacity={
                          activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                        }
                        stroke={
                          activeIndex === index
                            ? `var(--color-${categoryKey})`
                            : ""
                        }
                        onMouseEnter={() => setActiveIndex(index)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          {barChartInsights && (
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                <TrendingUp className="h-4 w-4" />
                Highest: <span className="font-semibold">{barChartInsights.highest.category}</span> (${barChartInsights.highest.cost.toFixed(6)}) | 
                Lowest: <span className="font-semibold">{barChartInsights.lowest.category}</span> (${barChartInsights.lowest.cost.toFixed(6)})
              </div>
              <div className="text-muted-foreground leading-none">
                Showing average cost per test across all categories
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Efficiency by Category</CardTitle>
          <CardDescription>Detailed cost metrics and pass rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-right p-2 font-medium">Total Cost</th>
                  <th className="text-right p-2 font-medium">Avg Cost/Test</th>
                  <th className="text-right p-2 font-medium">Cost/Correct</th>
                  <th className="text-right p-2 font-medium">Tests</th>
                  <th className="text-right p-2 font-medium">Pass Rate</th>
                  <th className="text-right p-2 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {sortedByTotalCost.map((cat, index) => {
                  const efficiency = cat.passRate / (cat.avgCost * 1000000);
                  const isEfficient = efficiency > 10;

                  return (
                    <tr key={cat.category} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{cat.category}</span>
                        </div>
                      </td>
                      <td className="text-right p-2 font-mono">${cat.totalCost.toFixed(6)}</td>
                      <td className="text-right p-2 font-mono">${cat.avgCost.toFixed(6)}</td>
                      <td className="text-right p-2 font-mono">${cat.costPerCorrectTest.toFixed(6)}</td>
                      <td className="text-right p-2">{cat.totalTests}</td>
                      <td className="text-right p-2">
                        <Badge variant={cat.passRate >= 90 ? "default" : cat.passRate >= 75 ? "secondary" : "destructive"}>
                          {cat.passRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        {isEfficient ? (
                          <TrendingUp className="inline h-4 w-4 text-[color:var(--status-success)]" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 text-[color:var(--status-error)]" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Token Economics */}
      <Card>
        <CardHeader>
          <CardTitle>Token Economics</CardTitle>
          <CardDescription>Token usage breakdown and distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Prompt Tokens</div>
              <div className="text-2xl font-bold">{Math.round(tokenEconomics.avgPromptTokens)}</div>
              <div className="text-xs text-muted-foreground">
                {tokenEconomics.promptTokenPercentage.toFixed(1)}% of total
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Completion Tokens</div>
              <div className="text-2xl font-bold">{Math.round(tokenEconomics.avgCompletionTokens)}</div>
              <div className="text-xs text-muted-foreground">
                {tokenEconomics.completionTokenPercentage.toFixed(1)}% of total
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Reasoning Tokens</div>
              <div className="text-2xl font-bold">{Math.round(tokenEconomics.avgReasoningTokens)}</div>
              <div className="text-xs text-muted-foreground">
                {tokenEconomics.reasoningTokenPercentage.toFixed(1)}% overhead
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm font-medium mb-2">Total Token Usage</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Prompt: {tokenEconomics.totalPromptTokens.toLocaleString()}</div>
              <div>Completion: {tokenEconomics.totalCompletionTokens.toLocaleString()}</div>
              <div>Reasoning: {tokenEconomics.totalReasoningTokens.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
