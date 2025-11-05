"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, FileX, Brain, MessageSquare, AlertTriangle } from "lucide-react";
import type { FailureReasonType } from "@/types/test-results";

interface FailureReasonBadgeProps {
  reasonType: FailureReasonType;
  reasonText: string;
  compact?: boolean;
}

export function FailureReasonBadge({
  reasonType,
  reasonText,
  compact = false,
}: FailureReasonBadgeProps) {
  const config = getReasonConfig(reasonType);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="text-xs gap-1 max-w-full cursor-help">
              {config.icon}
              <span className="truncate min-w-0">{reasonText}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-md">
            <div className="space-y-1">
              <div className="font-semibold text-xs">{config.label}</div>
              <p className="text-xs whitespace-normal">{reasonText}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-md p-2">
      <div className="text-destructive mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-destructive">{config.label}</div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {reasonText}
        </div>
      </div>
    </div>
  );
}

function getReasonConfig(reasonType: FailureReasonType) {
  const configs = {
    missing_policy_code: {
      label: "Missing Policy Reference",
      icon: <AlertCircle className="h-3 w-3" />,
    },
    wrong_classification: {
      label: "Wrong Classification",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    low_reasoning_quality: {
      label: "Low Quality Reasoning",
      icon: <Brain className="h-3 w-3" />,
    },
    no_reasoning: {
      label: "No Reasoning",
      icon: <FileX className="h-3 w-3" />,
    },
    policy_not_mentioned: {
      label: "Policy Not Mentioned",
      icon: <MessageSquare className="h-3 w-3" />,
    },
  };

  return configs[reasonType];
}
