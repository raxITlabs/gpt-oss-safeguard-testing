"use client";

/**
 * Budget Projection Calculator
 * Interactive widget to estimate production costs at scale
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, Zap, AlertTriangle } from "lucide-react";
import type { BudgetProjection, CategoryMixInput } from "@/types/analytics";
import { calculateBudgetProjections, prepareCategoryMixFromInferences } from "@/lib/cost-analyzer";
import type { InferenceEvent } from "@/types/test-results";

export interface BudgetCalculatorProps {
  inferences: InferenceEvent[];
  className?: string;
}

// Add Label component if it doesn't exist
const LabelComponent = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={className}>
    {children}
  </label>
);

export function BudgetCalculator({ inferences, className }: BudgetCalculatorProps) {
  // Initialize category mix from actual test data
  const initialCategoryMix = useMemo(() =>
    prepareCategoryMixFromInferences(inferences),
    [inferences]
  );

  const [dailyRequests, setDailyRequests] = useState(100000);
  const [categoryMix, setCategoryMix] = useState<CategoryMixInput[]>(initialCategoryMix);

  // Calculate projections
  const projection = useMemo(() => {
    return calculateBudgetProjections(inferences, dailyRequests, categoryMix);
  }, [inferences, dailyRequests, categoryMix]);

  // Update category percentage
  const updateCategoryPercentage = (category: string, percentage: number) => {
    setCategoryMix(prev =>
      prev.map(cat =>
        cat.category === category ? { ...cat, percentage } : cat
      )
    );
  };

  // Normalize percentages to sum to 100%
  const normalizePercentages = () => {
    const total = categoryMix.reduce((sum, cat) => sum + cat.percentage, 0);
    if (total !== 100 && total > 0) {
      setCategoryMix(prev =>
        prev.map(cat => ({
          ...cat,
          percentage: (cat.percentage / total) * 100
        }))
      );
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const totalPercentage = categoryMix.reduce((sum, cat) => sum + cat.percentage, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Production Budget Calculator
        </CardTitle>
        <CardDescription>
          Estimate monthly costs based on expected traffic volume
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Daily Requests Input */}
        <div className="space-y-4">
          <div className="space-y-2">
            <LabelComponent htmlFor="daily-requests" className="text-sm font-medium">
              Expected Daily Requests
            </LabelComponent>
            <Input
              id="daily-requests"
              type="number"
              value={dailyRequests}
              onChange={(e) => setDailyRequests(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Monthly: {(dailyRequests * 30).toLocaleString()} | Yearly: {(dailyRequests * 365).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Mix Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <LabelComponent className="text-sm font-medium">
              Category Distribution
            </LabelComponent>
            <Badge variant={Math.abs(totalPercentage - 100) < 0.1 ? "default" : "destructive"}>
              Total: {totalPercentage.toFixed(1)}%
            </Badge>
          </div>

          <div className="space-y-4">
            {categoryMix.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cat.category}</span>
                  <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={cat.percentage}
                  onChange={(e) => updateCategoryPercentage(cat.category, parseFloat(e.target.value))}
                  onBlur={normalizePercentages}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avg cost: ${cat.avgCost.toFixed(6)}</span>
                  <span>Pass rate: {cat.passRate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>

          {Math.abs(totalPercentage - 100) > 0.1 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Category percentages should sum to 100%. Current total: {totalPercentage.toFixed(1)}%
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <h4 className="text-sm font-semibold">Monthly Cost Breakdown</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Calls</span>
              <span className="font-medium">{formatCurrency(projection.costs.apiCallsCost)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Storage (logs)</span>
              <span className="font-medium">{formatCurrency(projection.costs.storageCost)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Manual Review (est.)</span>
              <span className="font-medium">{formatCurrency(projection.costs.falsePositiveReviewCost)}</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Monthly Cost</span>
                <span className="text-2xl font-bold">{formatCurrency(projection.costs.totalMonthlyCost)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Yearly Projection</span>
                <span className="font-medium">{formatCurrency(projection.costs.totalYearlyCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Impact */}
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance Impact
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Latency</span>
              <span className="font-medium">{Math.round(projection.performance.avgLatency)}ms</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">P95 Latency (est.)</span>
              <span className="font-medium">{Math.round(projection.performance.p95Latency)}ms</span>
            </div>

            <Alert className={
              projection.performance.avgLatency > 1000
                ? "border-[color:var(--status-error)] bg-[color:var(--status-error-bg)]"
                : projection.performance.avgLatency > 700
                ? "border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)]"
                : "border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]"
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {projection.performance.estimatedUserImpact}
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${(projection.costs.totalMonthlyCost / projection.monthlyRequests * 1000).toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Cost per 1K requests</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {(projection.costs.apiCallsCost / projection.costs.totalMonthlyCost * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">API cost share</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
