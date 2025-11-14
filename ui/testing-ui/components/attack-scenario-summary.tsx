"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { analyzeFailure } from "@/lib/failure-analyzer";

interface AttackScenarioSummaryProps {
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
}

export function AttackScenarioSummary({ inferences, strictPolicyValidation = true }: AttackScenarioSummaryProps) {
  // Filter for attack scenarios only
  const attackInferences = inferences.filter(inf => inf.test_type && inf.test_type !== 'baseline');

  if (attackInferences.length === 0) {
    return (
      <Card className="py-2">
        <CardHeader className="pb-2 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-none">
              No attack scenario tests in current dataset
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Group by test type
  const byTestType = attackInferences.reduce((acc, inf) => {
    const type = inf.test_type!;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(inf);
    return acc;
  }, {} as Record<string, InferenceEvent[]>);

  // Calculate stats per test type
  const stats = Object.entries(byTestType).map(([testType, tests]) => {
    const total = tests.length;
    const passed = tests.filter(t => analyzeFailure(t, strictPolicyValidation) === null).length;
    const failed = total - passed;
    const successRate = ((passed / total) * 100).toFixed(1);

    // Get icon for test type
    const icon = testType.includes('multi') ? RefreshCw :
                 testType.includes('prompt') || testType.includes('injection') ? Target :
                 AlertTriangle;

    // Format label (shortened)
    const label = testType
      .replace(/_/g, '-')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/Multi Turn/g, 'Multi-turn')
      .replace(/Prompt Injection/g, 'Prompt Inj.');

    return {
      testType,
      label,
      icon,
      total,
      passed,
      failed,
      successRate: parseFloat(successRate),
    };
  });

  // Overall attack scenario stats
  const totalAttacks = attackInferences.length;
  const totalPassed = attackInferences.filter(inf => analyzeFailure(inf, strictPolicyValidation) === null).length;
  const overallSuccessRate = ((totalPassed / totalAttacks) * 100).toFixed(1);

  const getSuccessRateVariant = (rate: number) => {
    if (rate >= 90) return "default";
    if (rate >= 70) return "secondary";
    return "destructive";
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "text-[color:var(--status-success)]";
    if (rate >= 70) return "text-[color:var(--status-warning)]";
    return "text-[color:var(--status-error)]";
  };

  return (
    <Card className="@container/card from-primary/5 to-card dark:to-card bg-gradient-to-t shadow-xs">
      <CardHeader>
        <CardTitle className="text-base">Attack Scenario Defense</CardTitle>
        <div className="text-3xl font-semibold tabular-nums">
          {overallSuccessRate}%
        </div>
        <div className="text-sm text-muted-foreground">
          {totalPassed} of {totalAttacks} tests passed
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Per Attack Type Breakdown */}
        <div className="space-y-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.testType}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Icon className={`h-4 w-4 ${getStatusColor(stat.successRate)} shrink-0`} />
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">
                      {stat.label}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[color:var(--status-success)]" />
                        {stat.passed}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-[color:var(--status-error)]" />
                        {stat.failed}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold tabular-nums">
                    {stat.successRate}%
                  </div>
                  <Badge variant={getSuccessRateVariant(stat.successRate)} className="text-xs">
                    {stat.successRate >= 90 ? "Good" : stat.successRate >= 70 ? "Fair" : "Poor"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
