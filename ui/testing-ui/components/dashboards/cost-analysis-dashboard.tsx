"use client";

/**
 * Cost Analysis Dashboard Container
 * Combines all cost-related visualizations and tools
 */

import { useMemo } from "react";
import { CostAccuracyScatter } from "./cost-accuracy-scatter";
import { BudgetCalculator } from "./budget-calculator";
import { CostBreakdown } from "./cost-breakdown";
import { MetricCard } from "@/components/metric-card-enhanced";
import type { InferenceEvent } from "@/types/test-results";
import {
  prepareCostAccuracyScatterData,
  calculateCostEfficiency,
  analyzeCostByCategory,
  analyzeTokenEconomics,
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
  const costEfficiency = useMemo(
    () => calculateCostEfficiency(inferences, strictPolicyValidation),
    [inferences, strictPolicyValidation]
  );
  const categoryBreakdown = useMemo(() => analyzeCostByCategory(inferences), [inferences]);
  const tokenEconomics = useMemo(() => analyzeTokenEconomics(inferences), [inferences]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Cost"
          value={`$${costEfficiency.totalCost.toFixed(6)}`}
          variant="default"
          footer={{
            primary: `Avg: $${costEfficiency.costPerTest.toFixed(6)} per test`,
            secondary: `Across ${costEfficiency.totalTests} tests`
          }}
        />

        <MetricCard
          title="Cost per Correct Test"
          value={`$${costEfficiency.costPerCorrectTest.toFixed(6)}`}
          variant={costEfficiency.costPerCorrectTest < costEfficiency.costPerTest * 1.2 ? "success" : "warning"}
          trend={{
            direction: costEfficiency.costPerCorrectTest < costEfficiency.costPerTest * 1.1 ? "down" : "up",
            value: `$${costEfficiency.costPerCorrectTest.toFixed(6)}`,
            label: costEfficiency.costPerCorrectTest < costEfficiency.costPerTest * 1.1 ? "Efficient" : "Review Needed"
          }}
          footer={{
            primary: "Quality-adjusted cost",
            secondary: `${costEfficiency.passedTests} passed tests`
          }}
        />

        <MetricCard
          title="Cost per 1K Tokens"
          value={`$${costEfficiency.costPer1000Tokens.toFixed(4)}`}
          variant="default"
          footer={{
            primary: "Token efficiency",
            secondary: "Per thousand tokens"
          }}
        />
      </div>

      {/* All content sections stacked vertically */}
      <div className="space-y-6">
        <CostAccuracyScatter
          data={scatterData}
          onPointClick={(point) => onTestClick?.(point.testNumber)}
          strictPolicyValidation={strictPolicyValidation}
        />

        <CostBreakdown
          categoryBreakdown={categoryBreakdown}
          tokenEconomics={tokenEconomics}
        />

        <BudgetCalculator inferences={inferences} />
      </div>
    </div>
  );
}
