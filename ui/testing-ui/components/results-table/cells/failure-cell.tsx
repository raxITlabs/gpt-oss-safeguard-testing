"use client";

import type { InferenceEvent } from "@/types/test-results";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { FailureReasonBadge } from "@/components/failure-reason-badge";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FailureCellProps {
  inference: InferenceEvent;
  strictPolicyValidation: boolean;
}

export function FailureCell({ inference, strictPolicyValidation }: FailureCellProps) {
  const failureAnalysis = analyzeFailure(inference, strictPolicyValidation);

  if (!failureAnalysis) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-green-600" />
        <span>No issues</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[250px]">
            <FailureReasonBadge
              reasonType={failureAnalysis.reasonType}
              reasonText={failureAnalysis.primaryReason}
              compact={true}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <p className="text-xs whitespace-normal">{failureAnalysis.primaryReason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
