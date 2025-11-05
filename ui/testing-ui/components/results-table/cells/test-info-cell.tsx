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

interface TestInfoCellProps {
  inference: InferenceEvent;
}

export function TestInfoCell({ inference }: TestInfoCellProps) {
  const policyText = extractPolicy(inference);
  const policy = policyText ? parsePolicy(policyText) : null;
  const policyCategory = policy ? getPolicyCategory(policy.code) : "N/A";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">#{inference.test_number}</span>
        <Badge variant="secondary" className="text-xs">
          {policyCategory}
        </Badge>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="font-medium text-sm truncate max-w-[300px] cursor-help">
              {inference.test_name}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p className="text-xs">{inference.test_name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {policy && (
        <div className="text-xs text-muted-foreground font-mono">
          {policy.code}
        </div>
      )}
    </div>
  );
}
