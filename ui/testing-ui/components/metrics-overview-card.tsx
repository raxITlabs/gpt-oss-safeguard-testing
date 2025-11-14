"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TokenBreakdown } from "./token-breakdown";
import { CostDisplay } from "./cost-display";
import { formatLatency } from "@/lib/format-utils";
import { Clock, DollarSign, Zap } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";

interface MetricsOverviewCardProps {
  test: InferenceEvent;
}

export function MetricsOverviewCard({ test }: MetricsOverviewCardProps) {
  const cost = test.metrics?.cost_usd || test.cost_usd || 0;
  const latency = test.metrics?.latency_ms || test.latency_ms || 0;
  const totalTokens = test.usage?.total_tokens || test.tokens?.total || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        {/* Token Breakdown */}
        <div className="bg-muted/50 p-2 rounded-md">
          <TokenBreakdown test={test} variant="compact" />
        </div>

        <Separator />

        {/* Cost & Latency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Cost</span>
            </div>
            <CostDisplay cost={cost} showDetails={true} size="sm" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Latency</span>
            </div>
            <p className="font-mono text-lg font-bold">{formatLatency(latency)}</p>
            {latency > 3000 && (
              <Badge variant="destructive" className="text-xs">Slow</Badge>
            )}
          </div>
        </div>

        {/* Cost Efficiency Indicator */}
        {totalTokens > 0 && (
          <div className="bg-[color:var(--status-info-bg)] border border-[color:var(--status-info)] p-2 rounded text-xs">
            <p className="text-muted-foreground">
              Cost per 1K tokens: <span className="font-mono font-semibold">
                ${((cost / totalTokens) * 1000).toFixed(4)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
