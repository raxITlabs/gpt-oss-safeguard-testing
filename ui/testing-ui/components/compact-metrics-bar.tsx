"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, BarChart3, Database } from "lucide-react";
import type { InferenceEvent, SessionSummary } from "@/types/test-results";
import { formatCurrency, formatLatency } from "@/lib/format-utils";
import { analyzePerformance } from "@/lib/performance-analyzer";
import { analyzeFailure } from "@/lib/failure-analyzer";

interface CompactMetricsBarProps {
  summary: SessionSummary;
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
}

export function CompactMetricsBar({ summary, inferences, strictPolicyValidation = true }: CompactMetricsBarProps) {
  const perfMetrics = analyzePerformance(inferences);

  // Recalculate pass/fail based on strictPolicyValidation setting
  let passed = 0;
  let failed = 0;

  inferences.forEach(inf => {
    const analysis = analyzeFailure(inf, strictPolicyValidation);
    // If analysis is null, the test passed
    // If analysis exists, the test failed
    if (analysis === null) {
      passed++;
    } else {
      failed++;
    }
  });

  const passRate = inferences.length > 0 ? (passed / inferences.length) * 100 : 0;

  const getPassRateVariant = (rate: number) => {
    if (rate >= 90) return "default";
    if (rate >= 70) return "secondary";
    return "destructive";
  };

  return (
    <Card className="py-2 gap-2">
      <CardHeader className="pb-2 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            <BarChart3 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] sm:text-xs text-muted-foreground leading-none">
              All Scenarios
            </span>
            <Badge variant={getPassRateVariant(passRate)} className="h-4 text-[9px] px-1 leading-none">
              {passRate >= 90 ? "Good" : passRate >= 70 ? "Fair" : "Poor"}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {passRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-muted-foreground leading-none">
              {inferences.length} test{inferences.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Avg Latency */}
          <div className="flex flex-col items-start space-y-0.5 p-2 border rounded hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-1.5 flex-wrap w-full">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="text-[10px] sm:text-xs text-muted-foreground leading-none flex-1">
                Avg Latency
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {formatLatency(perfMetrics.avgLatency)}
            </div>
            <div className="text-[10px] text-muted-foreground leading-none">
              {formatLatency(perfMetrics.latencyRange.min)} - {formatLatency(perfMetrics.latencyRange.max)}
            </div>
          </div>

          {/* Avg Cost */}
          <div className="flex flex-col items-start space-y-0.5 p-2 border rounded hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-1.5 flex-wrap w-full">
              <DollarSign className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="text-[10px] sm:text-xs text-muted-foreground leading-none flex-1">
                Avg Cost
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {formatCurrency(perfMetrics.avgCost)}
            </div>
            <div className="text-[10px] text-muted-foreground leading-none">
              Total: {formatCurrency(perfMetrics.totalCost)}
            </div>
          </div>

          {/* Total Tests & Tokens */}
          <div className="flex flex-col items-start space-y-0.5 p-2 border rounded hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-1.5 flex-wrap w-full">
              <Database className="h-3 w-3 text-muted-foreground shrink-0" />
              <div className="text-[10px] sm:text-xs text-muted-foreground leading-none flex-1">
                Tests & Tokens
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
              {inferences.length}
            </div>
            <div className="text-[10px] text-muted-foreground leading-none">
              {perfMetrics.totalTokens.toLocaleString()} tokens
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
