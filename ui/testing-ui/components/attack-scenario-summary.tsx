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
    <Card className="py-2 gap-2">
      <CardHeader className="pb-2 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-none">
              All Attack Scenarios
            </span>
            <Badge variant={getSuccessRateVariant(parseFloat(overallSuccessRate))} className="h-4 text-[9px] px-1 leading-none">
              {parseFloat(overallSuccessRate) >= 90 ? "Good" : parseFloat(overallSuccessRate) >= 70 ? "Fair" : "Poor"}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {overallSuccessRate}%
            </div>
            <div className="text-[10px] text-muted-foreground leading-none">
              {totalAttacks} test{totalAttacks !== 1 ? 's' : ''}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-0">
        {/* Per Attack Type Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.testType}
                className="flex flex-col items-start space-y-0.5 p-2 border rounded hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-1.5 flex-wrap w-full">
                  <Icon className={`h-3 w-3 ${getStatusColor(stat.successRate)} shrink-0`} />
                  <div className="text-[10px] sm:text-xs text-muted-foreground leading-none flex-1">
                    {stat.label}
                  </div>
                  <Badge variant={getSuccessRateVariant(stat.successRate)} className="h-4 text-[9px] px-1 leading-none">
                    {stat.successRate >= 90 ? "Good" : stat.successRate >= 70 ? "Fair" : "Poor"}
                  </Badge>
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  {stat.successRate}%
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-[color:var(--status-success)] shrink-0" />
                    {stat.passed}
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <XCircle className="h-2.5 w-2.5 text-[color:var(--status-error)] shrink-0" />
                    {stat.failed}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    · {stat.total} total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
