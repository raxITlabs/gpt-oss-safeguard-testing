"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatCostAdaptive, formatCostWithTooltip } from "@/lib/format-utils";

interface CostDisplayProps {
  cost: number;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CostDisplay({ cost, showDetails = true, size = "md" }: CostDisplayProps) {
  const { display, tooltip, scientific } = formatCostWithTooltip(cost);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold ${sizeClasses[size]}`}>
          {display}
        </span>
        {showDetails && cost < 0.01 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">Cost Details</p>
                  <p className="text-xs font-mono">{tooltip}</p>
                  <p className="text-xs text-muted-foreground">Scientific: {scientific}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {showDetails && cost < 0.01 && (
        <p className="text-xs text-muted-foreground font-mono">
          ≈ {scientific} (micro-cost)
        </p>
      )}
    </div>
  );
}
