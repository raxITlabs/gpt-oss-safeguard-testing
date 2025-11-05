"use client";

/**
 * Cost Breakdown Visualizations
 * Shows cost distribution by category with pie charts and bar charts
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import type { CategoryCostBreakdown, TokenEconomics } from "@/types/analytics";
import { useMemo } from "react";

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
  // Prepare pie chart data
  const pieData = useMemo(() => {
    return categoryBreakdown.map((cat, index) => ({
      name: cat.category,
      value: cat.totalCost,
      percentage: (cat.totalCost / categoryBreakdown.reduce((sum, c) => sum + c.totalCost, 0)) * 100,
      color: COLORS[index % COLORS.length],
    }));
  }, [categoryBreakdown]);

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

  // Sort by total cost for the table
  const sortedByTotalCost = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.totalCost - a.totalCost);
  }, [categoryBreakdown]);

  const totalCost = categoryBreakdown.reduce((sum, cat) => sum + cat.totalCost, 0);

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(6)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {categoryBreakdown.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Expensive Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedByTotalCost[0]?.category}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${sortedByTotalCost[0]?.totalCost.toFixed(6)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best Value Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...categoryBreakdown]
                .filter(c => c.passRate > 80)
                .sort((a, b) => a.costPerCorrectTest - b.costPerCorrectTest)[0]?.category || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Low cost + high accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Category</CardTitle>
            <CardDescription>Percentage of total cost by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill={COLORS[0]}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Average Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Average Cost per Test</CardTitle>
            <CardDescription>Cost comparison across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
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
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avgCost" fill={COLORS[0]} radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
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
