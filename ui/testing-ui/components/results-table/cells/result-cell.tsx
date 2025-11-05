"use client";

import { Badge } from "@/components/ui/badge";
import type { InferenceEvent } from "@/types/test-results";

interface ResultCellProps {
  inference: InferenceEvent;
}

export function ResultCell({ inference }: ResultCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Expected</div>
        <Badge variant="outline" className="font-mono">
          {inference.test_result?.expected ?? "N/A"}
        </Badge>
      </div>
      <div className="text-muted-foreground">→</div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Actual</div>
        <Badge variant="outline" className="font-mono">
          {inference.test_result?.actual ?? "N/A"}
        </Badge>
      </div>
    </div>
  );
}
