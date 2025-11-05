"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { InferenceEvent } from "@/types/test-results";

interface TokenBreakdownProps {
  test: InferenceEvent;
  variant?: "compact" | "detailed";
}

export function TokenBreakdown({ test, variant = "detailed" }: TokenBreakdownProps) {
  const promptTokens = test.usage?.prompt_tokens || test.tokens?.prompt || 0;
  const completionTokens = test.usage?.completion_tokens || test.tokens?.completion || 0;
  const reasoningTokens = test.tokens?.reasoning || 0;
  const totalTokens = test.usage?.total_tokens || test.tokens?.total || 0;

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Tokens</span>
          <span className="font-mono text-lg font-bold">{totalTokens.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{promptTokens.toLocaleString()} in</span>
          <span>•</span>
          <span>{completionTokens.toLocaleString()} out</span>
          {reasoningTokens > 0 && (
            <>
              <span>•</span>
              <span>{reasoningTokens.toLocaleString()} reasoning</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Visual Token Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Token Distribution</span>
          <span className="font-mono font-semibold">{totalTokens.toLocaleString()} total</span>
        </div>

        {/* Stacked bar visualization */}
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-chart-1 transition-all"
            style={{ width: `${(promptTokens / totalTokens) * 100}%` }}
            title={`Input: ${promptTokens.toLocaleString()}`}
          />
          <div
            className="bg-chart-2 transition-all"
            style={{ width: `${(completionTokens / totalTokens) * 100}%` }}
            title={`Output: ${completionTokens.toLocaleString()}`}
          />
          {reasoningTokens > 0 && (
            <div
              className="bg-chart-3 transition-all"
              style={{ width: `${(reasoningTokens / totalTokens) * 100}%` }}
              title={`Reasoning: ${reasoningTokens.toLocaleString()}`}
            />
          )}
        </div>
      </div>

      <Separator />

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-chart-1" />
            <span className="text-xs text-muted-foreground">Input</span>
          </div>
          <p className="font-mono text-base font-semibold ml-3.5">{promptTokens.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground ml-3.5">
            {((promptTokens / totalTokens) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span className="text-xs text-muted-foreground">Output</span>
          </div>
          <p className="font-mono text-base font-semibold ml-3.5">{completionTokens.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground ml-3.5">
            {((completionTokens / totalTokens) * 100).toFixed(1)}%
          </p>
        </div>

        {reasoningTokens > 0 && (
          <div className="space-y-0.5 col-span-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-chart-3" />
              <span className="text-xs text-muted-foreground">Reasoning</span>
              <Badge variant="secondary" className="text-xs py-0 h-4">Thinking</Badge>
            </div>
            <p className="font-mono text-base font-semibold ml-3.5">{reasoningTokens.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground ml-3.5">
              {((reasoningTokens / totalTokens) * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
