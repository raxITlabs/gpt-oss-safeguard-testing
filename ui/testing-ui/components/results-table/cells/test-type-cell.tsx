"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Target, RefreshCw, AlertTriangle } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestTypeCellProps {
  inference: InferenceEvent;
}

export function TestTypeCell({ inference }: TestTypeCellProps) {
  const testType = inference.test_type;

  if (!testType || testType === 'baseline') {
    return (
      <Badge variant="outline" className="text-xs gap-1.5 font-medium">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        Baseline
      </Badge>
    );
  }

  const icon = testType.includes('multi') ? RefreshCw :
              testType.includes('prompt') || testType.includes('injection') ? Target :
              AlertTriangle;

  const Icon = icon;
  const label = testType
    .replace(/_/g, '-')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="default"
            className="text-xs gap-1.5 bg-rose-500 hover:bg-rose-600 font-medium cursor-help"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{label} Attack Scenario</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
