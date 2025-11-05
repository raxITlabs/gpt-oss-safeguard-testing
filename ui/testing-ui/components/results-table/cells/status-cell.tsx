"use client";

import { StatusBadge } from "@/components/status-badge";
import type { InferenceEvent } from "@/types/test-results";
import { analyzeFailure } from "@/lib/failure-analyzer";

interface StatusCellProps {
  inference: InferenceEvent;
  strictPolicyValidation: boolean;
}

export function StatusCell({ inference, strictPolicyValidation }: StatusCellProps) {
  const isPassed = analyzeFailure(inference, strictPolicyValidation) === null;

  return <StatusBadge passed={isPassed} showIcon={true} />;
}
