"use client";

import { Badge } from "@/components/ui/badge";
import type { InferenceEvent } from "@/types/test-results";
import { extractPolicy, parsePolicy, getPolicyCategory } from "@/lib/policy-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TestInfoCellProps {
  inference: InferenceEvent;
  previousCategory?: string | null;
  showCategory?: boolean;
}

export function TestInfoCell({ inference, previousCategory, showCategory = true }: TestInfoCellProps) {
  const policyText = extractPolicy(inference);
  const policy = policyText ? parsePolicy(policyText) : null;
  const policyCategory = policy ? getPolicyCategory(policy.code) : "N/A";

  // Determine if category badge should be shown
  const shouldShowCategory = showCategory && (previousCategory === null || previousCategory !== policyCategory);

  // Calculate display values with fallbacks for backward compatibility
  const displayName = inference.test_name
    || inference.test_id
    || (inference.test_type === 'multi-turn'
        ? `${inference.attack_pattern || 'Unknown Pattern'} - Turn ${inference.turn_number || '?'}`
        : `${inference.test_type || 'Unknown'} Test`);

  const displayNumber = inference.test_number
    || inference.turn_number
    || 0;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sm font-semibold truncate">
                {displayName}
              </span>
              {shouldShowCategory && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {policyCategory}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                • #{displayNumber}
              </span>
              {policy && (
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-60" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <div className="space-y-1.5 text-xs">
              <div>
                <div className="font-semibold mb-1">Test Name</div>
                <p>{displayName}</p>
              </div>
              <div>
                <div className="font-semibold mb-1">Category</div>
                <p>{policyCategory}</p>
              </div>
              {policy && (
                <div>
                  <div className="font-semibold mb-1">Policy Code</div>
                  <p className="font-mono">{policy.code}</p>
                </div>
              )}
              <div>
                <div className="font-semibold mb-1">Test Number</div>
                <p className="font-mono">#{displayNumber}</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
