"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, DollarSign } from "lucide-react";
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-lg border">
      {/* Pass Rate */}
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="text-xs text-muted-foreground leading-none">Pass Rate</div>
          <Badge variant={getPassRateVariant(passRate)} className="h-5 text-[10px] px-1.5 leading-none self-center">
            {passRate >= 90 ? "Good" : passRate >= 70 ? "Fair" : "Poor"}
          </Badge>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
          {passRate.toFixed(1)}%
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5">
            <CheckCircle2 className="h-3 w-3 text-[color:var(--status-success)] shrink-0" />
            {passed}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <XCircle className="h-3 w-3 text-[color:var(--status-error)] shrink-0" />
            {failed}
          </span>
        </div>
      </div>

      {/* Avg Latency */}
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground leading-none">Avg Latency</div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
          {formatLatency(perfMetrics.avgLatency)}
        </div>
        <div className="text-xs text-muted-foreground leading-none">
          {formatLatency(perfMetrics.latencyRange.min)} - {formatLatency(perfMetrics.latencyRange.max)}
        </div>
      </div>

      {/* Avg Cost */}
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground leading-none">Avg Cost</div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
          {formatCurrency(perfMetrics.avgCost)}
        </div>
        <div className="text-xs text-muted-foreground leading-none">
          Total: {formatCurrency(perfMetrics.totalCost)}
        </div>
      </div>

      {/* Total Tests & Tokens */}
      <div className="flex flex-col items-start space-y-1">
        <div className="text-xs text-muted-foreground leading-none">Tests & Tokens</div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-none">
          {summary.results.total_tests}
        </div>
        <div className="text-xs text-muted-foreground leading-none">
          {perfMetrics.totalTokens.toLocaleString()} tokens
        </div>
      </div>
    </div>
  );
}
