import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  passed: boolean;
  showIcon?: boolean;
}

export function StatusBadge({ passed, showIcon = true }: StatusBadgeProps) {
  return (
    <Badge variant={passed ? "default" : "destructive"} className="flex items-center gap-1">
      {showIcon && (
        passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />
      )}
      {passed ? "PASS" : "FAIL"}
    </Badge>
  );
}
