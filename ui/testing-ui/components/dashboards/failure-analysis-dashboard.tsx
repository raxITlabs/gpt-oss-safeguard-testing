"use client";

/**
 * Failure Analysis Dashboard Container
 * Complete failure analysis with groups, distributions, and recommendations
 */

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { FailureGroups } from "./failure-groups";
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
import { AlertCircle, TrendingDown, Lightbulb, CheckCircle2 } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { CATEGORY_COLORS } from "@/lib/constants";
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
          subtitle={`${totalTests} total tests`}
          icon={<AlertCircle className="h-4 w-4" />}
          status={failedTests === 0 ? "excellent" : failedTests < totalTests * 0.05 ? "good" : failedTests < totalTests * 0.1 ? "warning" : "critical"}
        />

        <MetricCard
          title="Pass Rate"
          value={`${passRate.toFixed(1)}%`}
          subtitle={`${passedTests} passed`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          status={passRate >= 95 ? "excellent" : passRate >= 90 ? "good" : passRate >= 80 ? "warning" : "critical"}
          size="large"
        />

        <MetricCard
          title="Failure Patterns"
          value={failureGroups.length}
          subtitle="Distinct types"
          icon={<TrendingDown className="h-4 w-4" />}
        />

        <MetricCard
          title="Action Items"
          value={highPriorityRecommendations.length}
          subtitle="High priority"
          icon={<Lightbulb className="h-4 w-4" />}
          status={highPriorityRecommendations.length > 0 ? "warning" : "good"}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups">Failure Groups</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          <FailureGroups groups={failureGroups} onTestClick={onTestClick} />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <FailureDistributionCharts distribution={failureDistribution} />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <RecommendationsPanel groups={failureGroups} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Failure Distribution Charts Component
function FailureDistributionCharts({ distribution }: { distribution: ReturnType<typeof createFailureDistribution> }) {
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Card className="p-3 shadow-lg">
          <div className="space-y-1 text-xs">
            <div className="font-semibold">{data.name || data.payload.name}</div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Count:</span>
              <span className="font-medium">{data.value || data.payload.count}</span>
            </div>
            {data.payload.percentage !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Percentage:</span>
                <span className="font-medium">{data.payload.percentage.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribution.byReason}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ displayName, percentage }) => `${displayName}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  dataKey="count"
                >
                  {distribution.byReason.map((entry, index) => {
                    // Use brand color based on predominant category
                    const categoryKey = entry.category ? `${entry.category}-baseline` : 'unknown';
                    const brandColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS[entry.category || 'unknown'] || CATEGORY_COLORS['unknown'];
                    return <Cell key={`cell-${index}`} fill={brandColor} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - By Category */}
        <Card>
          <CardHeader>
            <CardTitle>Failures by Category</CardTitle>
            <CardDescription>Failure rates across test categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribution.byCategory} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="failed" radius={[4, 4, 0, 0]}>
                  {distribution.byCategory.map((entry, index) => {
                    const categoryColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['unknown'];
                    return <Cell key={`failed-${index}`} fill={categoryColor} opacity={0.9} />;
                  })}
                </Bar>
                <Bar dataKey="passed" radius={[4, 4, 0, 0]}>
                  {distribution.byCategory.map((entry, index) => {
                    const categoryColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['unknown'];
                    return <Cell key={`passed-${index}`} fill={categoryColor} opacity={0.4} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                {distribution.byCategory.map((cat) => {
                  const categoryColor = CATEGORY_COLORS[`${cat.category}-baseline`] || CATEGORY_COLORS[cat.category] || CATEGORY_COLORS['unknown'];
                  return (
                  <tr key={cat.category} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColor }}
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
