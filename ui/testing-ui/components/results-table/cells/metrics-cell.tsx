"use client";

import type { InferenceEvent } from "@/types/test-results";
import { formatCurrency, formatLatency } from "@/lib/format-utils";

interface MetricsCellProps {
  inference: InferenceEvent;
}

export function MetricsCell({ inference }: MetricsCellProps) {
  const tokens = inference.usage?.total_tokens || 0;
  const cost = inference.metrics?.cost_usd || 0;
  const latency = inference.metrics?.latency_ms || 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Tokens:</span>
        <span className="font-mono text-sm font-medium">{tokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Cost:</span>
        <span className="font-mono text-sm font-medium">{formatCurrency(cost)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Time:</span>
        <span className="font-mono text-sm font-medium">{formatLatency(latency)}</span>
      </div>
    </div>
  );
}
