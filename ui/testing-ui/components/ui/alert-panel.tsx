/**
 * Alert panel component for displaying critical alerts, warnings, and SLA violations
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { Alert as AlertType } from "@/types/analytics";

export interface AlertPanelProps {
  alerts: AlertType[];
  onDismiss?: (index: number) => void;
  onViewDetails?: (alert: AlertType) => void;
  maxVisible?: number;
  className?: string;
}

const severityIcons = {
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

const severityColors = {
  high: {
    border: "border-[color:var(--priority-high)]",
    bg: "bg-[color:var(--priority-high-bg)]",
    text: "text-[color:var(--priority-high)]",
    icon: "text-[color:var(--priority-high)]",
  },
  medium: {
    border: "border-[color:var(--priority-medium)]",
    bg: "bg-[color:var(--priority-medium-bg)]",
    text: "text-[color:var(--priority-medium)]",
    icon: "text-[color:var(--priority-medium)]",
  },
  low: {
    border: "border-[color:var(--priority-low)]",
    bg: "bg-[color:var(--priority-low-bg)]",
    text: "text-[color:var(--priority-low)]",
    icon: "text-[color:var(--priority-low)]",
  },
};

const typeLabels = {
  cost: "Cost Alert",
  performance: "Performance Alert",
  quality: "Quality Alert",
  budget: "Budget Alert",
};

export function AlertPanel({
  alerts,
  onDismiss,
  onViewDetails,
  maxVisible = 3,
  className,
}: AlertPanelProps) {
  const [showAll, setShowAll] = useState(false);

  if (alerts.length === 0) {
    return null;
  }

  const visibleAlerts = showAll ? alerts : alerts.slice(0, maxVisible);
  const hasMore = alerts.length > maxVisible;

  return (
    <div className={cn("space-y-3", className)}>
      {visibleAlerts.map((alert, index) => (
        <AlertItem
          key={index}
          alert={alert}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
          onViewDetails={onViewDetails}
        />
      ))}

      {hasMore && !showAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full"
        >
          <ChevronDown className="mr-2 h-4 w-4" />
          Show {alerts.length - maxVisible} more alerts
        </Button>
      )}

      {showAll && hasMore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(false)}
          className="w-full"
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Show less
        </Button>
      )}
    </div>
  );
}

function AlertItem({
  alert,
  onDismiss,
  onViewDetails,
}: {
  alert: AlertType;
  onDismiss?: () => void;
  onViewDetails?: (alert: AlertType) => void;
}) {
  const Icon = severityIcons[alert.severity];
  const colors = severityColors[alert.severity];

  return (
    <Alert className={cn("relative", colors.border, colors.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5", colors.icon)} />

        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTitle className={cn("text-sm font-semibold", colors.text)}>
                  {alert.title}
                </AlertTitle>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[alert.type]}
                </Badge>
              </div>
              <AlertDescription className={cn("text-sm", colors.text)}>
                {alert.description}
              </AlertDescription>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss alert</span>
              </Button>
            )}
          </div>

          {/* Metrics */}
          {(alert.threshold !== undefined || alert.actual !== undefined || alert.affectedTests !== undefined) && (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {alert.threshold !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Threshold:</span>
                  <span className="font-medium">{alert.threshold}</span>
                </div>
              )}
              {alert.actual !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Actual:</span>
                  <span className={cn(
                    "font-medium",
                    alert.threshold && alert.actual > alert.threshold
                      ? colors.icon
                      : "text-foreground"
                  )}>
                    {alert.actual}
                  </span>
                </div>
              )}
              {alert.affectedTests !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Affected Tests:</span>
                  <span className="font-medium">{alert.affectedTests}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {onViewDetails && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onViewDetails(alert)}
              className="h-auto p-0 text-xs"
            >
              View details →
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

// Specialized alert components

export function SLAViolationAlert({
  violations,
  threshold,
  avgViolation,
  onViewDetails,
  className,
}: {
  violations: number;
  threshold: number;
  avgViolation: number;
  onViewDetails?: () => void;
  className?: string;
}) {
  return (
    <AlertItem
      alert={{
        severity: violations > 10 ? "high" : "medium",
        type: "performance",
        title: "SLA Violations Detected",
        description: `${violations} tests exceeded the ${threshold}ms latency threshold by an average of ${Math.round(avgViolation)}ms`,
        threshold,
        actual: threshold + avgViolation,
        affectedTests: violations,
      }}
      onViewDetails={onViewDetails ? () => onViewDetails() : undefined}
    />
  );
}

export function BudgetAlert({
  currentSpend,
  budget,
  projectedMonthly,
  onViewDetails,
  className,
}: {
  currentSpend: number;
  budget: number;
  projectedMonthly: number;
  onViewDetails?: () => void;
  className?: string;
}) {
  const percentUsed = (currentSpend / budget) * 100;

  return (
    <AlertItem
      alert={{
        severity: percentUsed > 90 ? "high" : percentUsed > 75 ? "medium" : "low",
        type: "budget",
        title: "Budget Warning",
        description: `Current spend ($${currentSpend.toFixed(2)}) is ${percentUsed.toFixed(1)}% of budget. Projected monthly: $${projectedMonthly.toFixed(2)}`,
        threshold: budget,
        actual: currentSpend,
      }}
      onViewDetails={onViewDetails ? () => onViewDetails() : undefined}
    />
  );
}

export function QualityAlert({
  failedTests,
  totalTests,
  targetAccuracy,
  topFailureReason,
  onViewDetails,
  className,
}: {
  failedTests: number;
  totalTests: number;
  targetAccuracy: number;
  topFailureReason: string;
  onViewDetails?: () => void;
  className?: string;
}) {
  const accuracy = ((totalTests - failedTests) / totalTests) * 100;
  const shortfall = targetAccuracy - accuracy;

  return (
    <AlertItem
      alert={{
        severity: shortfall > 5 ? "high" : "medium",
        type: "quality",
        title: "Below Target Accuracy",
        description: `Accuracy ${accuracy.toFixed(1)}% is ${shortfall.toFixed(1)}% below target. Top reason: ${topFailureReason}`,
        threshold: targetAccuracy,
        actual: accuracy,
        affectedTests: failedTests,
      }}
      onViewDetails={onViewDetails ? () => onViewDetails() : undefined}
    />
  );
}

// Summary alert component
export function AlertSummary({
  alerts,
  className,
}: {
  alerts: AlertType[];
  className?: string;
}) {
  const highSeverity = alerts.filter(a => a.severity === "high").length;
  const mediumSeverity = alerts.filter(a => a.severity === "medium").length;
  const lowSeverity = alerts.filter(a => a.severity === "low").length;

  if (alerts.length === 0) {
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-lg border border-[color:var(--status-success)] bg-[color:var(--status-success-bg)] p-3",
        className
      )}>
        <CheckCircle2 className="h-5 w-5 text-[color:var(--status-success)]" />
        <span className="text-sm font-medium text-[color:var(--status-success)]">
          All systems operational - no alerts
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-4 rounded-lg border border-border bg-muted p-3",
      className
    )}>
      <span className="text-sm font-medium">Active Alerts:</span>
      {highSeverity > 0 && (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {highSeverity} High
        </Badge>
      )}
      {mediumSeverity > 0 && (
        <Badge variant="outline" className="gap-1 border-[color:var(--priority-medium)] text-[color:var(--priority-medium)]">
          <AlertTriangle className="h-3 w-3" />
          {mediumSeverity} Medium
        </Badge>
      )}
      {lowSeverity > 0 && (
        <Badge variant="outline" className="gap-1 border-[color:var(--priority-low)] text-[color:var(--priority-low)]">
          <Info className="h-3 w-3" />
          {lowSeverity} Low
        </Badge>
      )}
    </div>
  );
}
