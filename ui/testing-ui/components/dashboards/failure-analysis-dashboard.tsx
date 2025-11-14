"use client";

/**
 * Failure Analysis Dashboard Container
 * Complete failure analysis with groups, distributions, and recommendations
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card-enhanced";
import { FailureGroups } from "./failure-groups";
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import {
  createFailurePatternGroups,
  createFailureDistribution,
  analyzeFailure,
} from "@/lib/failure-analyzer";

export interface FailureAnalysisDashboardProps {
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
  onTestClick?: (testNumber: number) => void;
  className?: string;
}

export function FailureAnalysisDashboard({
  inferences,
  strictPolicyValidation = true,
  onTestClick,
  className,
}: FailureAnalysisDashboardProps) {
  const failureGroups = useMemo(
    () => createFailurePatternGroups(inferences, strictPolicyValidation),
    [inferences, strictPolicyValidation]
  );
  const failureDistribution = useMemo(
    () => createFailureDistribution(inferences, strictPolicyValidation),
    [inferences, strictPolicyValidation]
  );

  const totalTests = inferences.length;

  // Recalculate pass/fail based on strictPolicyValidation setting
  let passedTests = 0;
  let failedTests = 0;

  inferences.forEach(inf => {
    const analysis = analyzeFailure(inf, strictPolicyValidation);
    if (analysis === null) {
      passedTests++;
    } else {
      failedTests++;
    }
  });

  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Get all recommendations
  const allRecommendations = failureGroups.flatMap(group => group.recommendations);
  const highPriorityRecommendations = allRecommendations.filter(r => r.priority === "high");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Failures"
          value={failedTests}
          variant={failedTests === 0 ? "success" : failedTests < totalTests * 0.05 ? "default" : failedTests < totalTests * 0.1 ? "warning" : "destructive"}
          trend={{
            direction: failedTests === 0 ? "down" : "up",
            value: failedTests.toString(),
            label: failedTests === 0 ? "Perfect" : failedTests < totalTests * 0.05 ? "Low" : failedTests < totalTests * 0.1 ? "Moderate" : "High",
          }}
          footer={{
            primary: failedTests === 0 ? "No failures detected" : "Failures detected",
            secondary: `${totalTests} total tests`,
          }}
        />

        <MetricCard
          title="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          variant={passRate >= 95 ? "success" : passRate >= 90 ? "default" : passRate >= 80 ? "warning" : "destructive"}
          trend={{
            direction: passRate >= 90 ? "up" : "down",
            value: `${passRate.toFixed(1)}%`,
            label: passRate >= 95 ? "Excellent" : passRate >= 90 ? "Good" : passRate >= 80 ? "Fair" : "Poor",
          }}
          footer={{
            primary: `${passedTests} passed`,
            secondary: "Tests successfully completed",
          }}
          size="large"
        />

        <MetricCard
          title="Failure Patterns"
          value={failureGroups.length}
          variant="default"
          footer={{
            primary: "Distinct types",
            secondary: "Unique failure categories identified",
          }}
        />

        <MetricCard
          title="Action Items"
          value={highPriorityRecommendations.length}
          variant={highPriorityRecommendations.length > 0 ? "warning" : "success"}
          trend={{
            direction: highPriorityRecommendations.length > 0 ? "up" : "down",
            value: highPriorityRecommendations.length.toString(),
            label: highPriorityRecommendations.length > 0 ? "Action needed" : "All clear",
          }}
          footer={{
            primary: "High priority",
            secondary: highPriorityRecommendations.length > 0 ? "Recommendations pending" : "No urgent actions",
          }}
        />
      </div>

      {/* All content sections stacked vertically */}
      <div className="space-y-6">
        <FailureGroups groups={failureGroups} onTestClick={onTestClick} />

        <FailureDistributionCharts distribution={failureDistribution} />

        <RecommendationsPanel groups={failureGroups} />
      </div>
    </div>
  );
}

// Dotted background pattern component (moved outside to avoid re-creation on render)
const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="failure-analysis-pattern-dots"
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

// Failure Distribution Charts Component
function FailureDistributionCharts({ distribution }: { distribution: ReturnType<typeof createFailureDistribution> }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Create chart config for pie chart (by reason)
  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Count",
      },
    };
    
    distribution.byReason.forEach((entry, index) => {
      const key = entry.reasonType || `reason-${index}`;
      config[key] = {
        label: entry.displayName,
        color: `var(--chart-${(index % 8) + 1})`,
      };
    });
    
    return config;
  }, [distribution.byReason]);

  // Prepare pie chart data with fill colors
  const pieChartData = useMemo(() => {
    return distribution.byReason.map((entry, index) => ({
      ...entry,
      fill: `var(--chart-${(index % 8) + 1})`,
      name: entry.reasonType || `reason-${index}`, // For legend
    }));
  }, [distribution.byReason]);

  // Create chart config for bar chart (by category)
  const barChartConfig = useMemo(() => {
    const config: ChartConfig = {
      failed: {
        label: "Failed",
      },
      passed: {
        label: "Passed",
      },
    };
    
    distribution.byCategory.forEach((entry, index) => {
      const categoryKey = entry.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
      config[categoryKey] = {
        label: entry.category,
        color: `var(--chart-${(index % 8) + 1})`,
      };
    });
    
    return config;
  }, [distribution.byCategory]);

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    return distribution.byCategory.map((entry, index) => ({
      ...entry,
      categoryKey: entry.category.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    }));
  }, [distribution.byCategory]);

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return barChartData[activeIndex];
  }, [activeIndex, barChartData]);

  // Early return after all hooks to comply with Rules of Hooks
  if (distribution.totalFailures === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failure Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-[color:var(--status-success)]" />
            <p>No failures to analyze!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - By Reason */}
        <Card>
          <CardHeader>
            <CardTitle>Failures by Reason</CardTitle>
            <CardDescription>Distribution of failure types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  dataKey="count"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - By Category */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Failures by Category</CardTitle>
            <CardDescription>
              {activeData
                ? `${activeData.category}: ${activeData.failed} failed, ${activeData.passed} passed`
                : "Failure rates across test categories"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={barChartConfig}>
              <BarChart
                accessibilityLayer
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="85%"
                  fill="url(#failure-analysis-pattern-dots)"
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
                    value: "Count",
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
                        const dataKey = item?.dataKey || name;
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{categoryName} ({dataKey}):</span>
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Bar dataKey="failed" radius={4}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      className="duration-200"
                      key={`failed-${index}`}
                      fill={`var(--color-${entry.categoryKey})`}
                      fillOpacity={
                        activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                      }
                      stroke={
                        activeIndex === index
                          ? `var(--color-${entry.categoryKey})`
                          : ""
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </Bar>
                <Bar dataKey="passed" radius={4}>
                  {barChartData.map((entry, index) => (
                    <Cell
                      className="duration-200"
                      key={`passed-${index}`}
                      fill={`var(--color-${entry.categoryKey})`}
                      fillOpacity={
                        activeIndex === null ? 0.4 : activeIndex === index ? 0.4 : 0.1
                      }
                      stroke={
                        activeIndex === index
                          ? `var(--color-${entry.categoryKey})`
                          : ""
                      }
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Failure Analysis</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Category</th>
                  <th className="text-right p-2 font-medium">Total</th>
                  <th className="text-right p-2 font-medium">Passed</th>
                  <th className="text-right p-2 font-medium">Failed</th>
                  <th className="text-right p-2 font-medium">Failure Rate</th>
                  <th className="text-left p-2 font-medium">Top Reason</th>
                </tr>
              </thead>
              <tbody>
                {distribution.byCategory.map((cat, index) => {
                  const chartColorIndex = (index % 8) + 1;
                  return (
                  <tr key={cat.category} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: `var(--chart-${chartColorIndex})` }}
                        />
                        <span className="font-medium">{cat.category}</span>
                      </div>
                    </td>
                    <td className="text-right p-2">{cat.total}</td>
                    <td className="text-right p-2 text-[color:var(--status-success)]">{cat.passed}</td>
                    <td className="text-right p-2 text-[color:var(--status-error)]">{cat.failed}</td>
                    <td className="text-right p-2">
                      <Badge variant={cat.failureRate > 15 ? "destructive" : cat.failureRate > 5 ? "secondary" : "outline"}>
                        {cat.failureRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-2">
                      {cat.topFailureReason && (
                        <Badge variant="outline" className="text-xs">
                          {cat.topFailureReason.replace(/_/g, " ")}
                        </Badge>
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
    </div>
  );
}

// Recommendations Panel Component
function RecommendationsPanel({ groups }: { groups: ReturnType<typeof createFailurePatternGroups> }) {
  const allRecommendations = groups.flatMap(group =>
    group.recommendations.map(rec => ({ ...rec, group: group.displayName, reasonType: group.reasonType }))
  );

  const sortedRecommendations = allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (allRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50 text-[color:var(--status-success)]" />
            <p>No recommendations needed!</p>
            <p className="text-sm mt-2">All tests are passing.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription>
            {allRecommendations.length} recommendations to improve test accuracy
          </CardDescription>
        </CardHeader>
      </Card>

      {sortedRecommendations.map((rec, index) => (
        <Card key={index} className={`border-l-4 ${
          rec.priority === "high"
            ? "border-l-[color:var(--status-error)]"
            : rec.priority === "medium"
            ? "border-l-[color:var(--status-warning)]"
            : "border-l-[color:var(--status-info)]"
        }`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>{rec.group}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{rec.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Estimated Impact</div>
                <div className="text-muted-foreground">{rec.estimatedImpact}</div>
              </div>
              <div>
                <div className="font-medium mb-1">Affected Tests</div>
                <div className="text-2xl font-bold">{rec.affectedTests}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Badge variant="outline" className="mb-2">{rec.actionType.replace(/_/g, " ")}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
