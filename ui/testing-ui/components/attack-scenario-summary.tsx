"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Target, RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Attack Scenario Performance
          </CardTitle>
          <CardDescription>
            No attack scenario tests in current dataset. Attack scenarios test the model's resilience against adversarial inputs.
          </CardDescription>
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

    // Format label
    const label = testType
      .replace(/_/g, '-')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Attack Scenario Performance
        </CardTitle>
        <CardDescription>
          {totalAttacks} attack tests across {stats.length} scenario type{stats.length !== 1 ? 's' : ''} • {overallSuccessRate}% overall defense rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Status */}
        <Alert className={parseFloat(overallSuccessRate) >= 90 ? "border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]" :
                         parseFloat(overallSuccessRate) >= 70 ? "border-[color:var(--status-warning)] bg-[color:var(--status-warning-bg)]" :
                         "border-[color:var(--status-error)] bg-[color:var(--status-error-bg)]"}>
          <AlertDescription className="flex items-center gap-2">
            {parseFloat(overallSuccessRate) >= 90 ? (
              <>
                <CheckCircle className="h-4 w-4 text-[color:var(--status-success)]" />
                <span className="text-[color:var(--status-success)] font-medium">Excellent defense against attacks</span>
              </>
            ) : parseFloat(overallSuccessRate) >= 70 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-[color:var(--status-warning)]" />
                <span className="text-[color:var(--status-warning)] font-medium">Moderate defense - review failed tests</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-[color:var(--status-error)]" />
                <span className="text-[color:var(--status-error)] font-medium">Vulnerable to attacks - immediate attention needed</span>
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Per Attack Type Breakdown */}
        <div className="mt-6 space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.testType}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[color:var(--status-error-bg)]">
                    <Icon className="h-5 w-5 text-[color:var(--status-error)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stat.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stat.total} test{stat.total !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {stat.passed} passed · {stat.failed} failed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Success Rate Indicator */}
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {stat.successRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      defense rate
                    </div>
                  </div>
                  {stat.successRate >= 90 ? (
                    <CheckCircle className="h-6 w-6 text-[color:var(--status-success)]" />
                  ) : stat.successRate >= 70 ? (
                    <AlertTriangle className="h-6 w-6 text-[color:var(--status-warning)]" />
                  ) : (
                    <XCircle className="h-6 w-6 text-[color:var(--status-error)]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Attack Type Explanations */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Attack Types Explained</h4>
          <div className="grid gap-3 text-sm">
            <div className="flex gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Multi-turn:</span>
                <span className="text-muted-foreground ml-1">
                  Conversation-based attacks that gradually manipulate context over multiple exchanges
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Prompt Injection:</span>
                <span className="text-muted-foreground ml-1">
                  Direct attempts to override system instructions with malicious prompts
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Over-refusal:</span>
                <span className="text-muted-foreground ml-1">
                  Tests for false positives where legitimate content is incorrectly flagged
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
