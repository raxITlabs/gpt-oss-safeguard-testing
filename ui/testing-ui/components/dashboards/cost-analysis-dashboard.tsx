"use client";

/**
 * Cost Analysis Dashboard Container
 * Combines all cost-related visualizations and tools
 */

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostAccuracyScatter } from "./cost-accuracy-scatter";
import { BudgetCalculator } from "./budget-calculator";
import { CostBreakdown } from "./cost-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { DollarSign, TrendingUp, Zap, AlertCircle } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import {
  prepareCostAccuracyScatterData,
  calculateCostEfficiency,
  analyzeCostByCategory,
  analyzeTokenEconomics,
  identifyOptimizationOpportunities,
} from "@/lib/cost-analyzer";

export interface CostAnalysisDashboardProps {
  inferences: InferenceEvent[];
  onTestClick?: (testNumber: number) => void;
  strictPolicyValidation?: boolean;
  className?: string;
}

export function CostAnalysisDashboard({
  inferences,
  onTestClick,
  strictPolicyValidation = true,
  className,
}: CostAnalysisDashboardProps) {
  // Prepare all cost data with strict policy validation support
  const scatterData = useMemo(
    () => prepareCostAccuracyScatterData(inferences, strictPolicyValidation),
    [inferences, strictPolicyValidation]
  );
  const costEfficiency = useMemo(() => calculateCostEfficiency(inferences), [inferences]);
  const categoryBreakdown = useMemo(() => analyzeCostByCategory(inferences), [inferences]);
  const tokenEconomics = useMemo(() => analyzeTokenEconomics(inferences), [inferences]);
  const optimizationOpportunities = useMemo(
    () => identifyOptimizationOpportunities(inferences),
    [inferences]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cost"
          value={`$${costEfficiency.totalCost.toFixed(6)}`}
          subtitle={`${costEfficiency.totalTests} tests`}
          icon={<DollarSign className="h-4 w-4" />}
          description={`Avg: $${costEfficiency.costPerTest.toFixed(6)} per test`}
        />

        <MetricCard
          title="Cost per Correct Test"
          value={`$${costEfficiency.costPerCorrectTest.toFixed(6)}`}
          subtitle={`${costEfficiency.passedTests} passed`}
          icon={<TrendingUp className="h-4 w-4" />}
          status={costEfficiency.costPerCorrectTest < costEfficiency.costPerTest * 1.1 ? "good" : "warning"}
        />

        <MetricCard
          title="Cost per 1K Tokens"
          value={`$${costEfficiency.costPer1000Tokens.toFixed(4)}`}
          subtitle="Token efficiency"
          icon={<Zap className="h-4 w-4" />}
        />

        <MetricCard
          title="Optimization Opportunities"
          value={optimizationOpportunities.length}
          subtitle="Potential savings"
          icon={<AlertCircle className="h-4 w-4" />}
          status={optimizationOpportunities.length > 0 ? "warning" : "good"}
          description={
            optimizationOpportunities.length > 0
              ? "Click to view recommendations"
              : "No immediate optimizations needed"
          }
        />
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="trade-off" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trade-off">Cost-Accuracy</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="calculator">Budget Calculator</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="trade-off" className="mt-6">
          <CostAccuracyScatter
            data={scatterData}
            onPointClick={(point) => onTestClick?.(point.testNumber)}
            strictPolicyValidation={strictPolicyValidation}
          />
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <CostBreakdown
            categoryBreakdown={categoryBreakdown}
            tokenEconomics={tokenEconomics}
          />
        </TabsContent>

        <TabsContent value="calculator" className="mt-6">
          <BudgetCalculator inferences={inferences} />
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <OptimizationPanel opportunities={optimizationOpportunities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Optimization opportunities panel
function OptimizationPanel({ opportunities }: { opportunities: ReturnType<typeof identifyOptimizationOpportunities> }) {
  if (opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No immediate optimization opportunities identified.</p>
            <p className="text-sm mt-2">Your cost efficiency is already optimal!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We've identified {opportunities.length} potential ways to reduce costs while maintaining quality.
          </p>
        </CardContent>
      </Card>

      {opportunities.map((opp, index) => (
        <Card key={index} className="border-l-4 border-l-amber-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{opp.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[color:var(--status-success)]">
                  {opp.estimatedSavings.costSavingsPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Est. savings</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Current State</div>
                <div className="text-muted-foreground">{opp.currentState}</div>
              </div>
              <div>
                <div className="font-medium mb-1">Proposed Change</div>
                <div className="text-muted-foreground">{opp.proposedState}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Estimated Savings</div>
                <div className="text-[color:var(--status-success)] font-semibold">
                  ${opp.estimatedSavings.costSavingsUSD.toFixed(6)}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Risk Level</div>
                <div className={
                  opp.risk === "low"
                    ? "text-[color:var(--status-success)]"
                    : opp.risk === "medium"
                    ? "text-[color:var(--status-warning)]"
                    : "text-[color:var(--status-error)]"
                }>
                  {opp.risk.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Affected Tests</div>
                <div>{opp.affectedTests}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="font-medium text-sm mb-2">Implementation Guide</div>
              <p className="text-sm text-muted-foreground">{opp.implementation}</p>
            </div>

            {opp.risk !== "low" && (
              <div className="rounded-lg border border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)] p-3">
                <div className="text-sm font-medium text-[color:var(--status-warning)]">
                  ⚠️ Risk Assessment
                </div>
                <div className="text-xs text-[color:var(--status-warning)] opacity-80 mt-1">
                  {opp.riskDescription}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
