/**
 * Trend indicator component for showing up/down/stable trends
 */

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendIndicatorProps {
  value: number; // Percentage change
  direction?: "up" | "down" | "stable"; // Optional override
  isPositive?: boolean; // Whether the trend is good (auto-determined if not provided)
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function TrendIndicator({
  value,
  direction,
  isPositive,
  showValue = true,
  size = "md",
  className,
  label,
}: TrendIndicatorProps) {
  // Determine direction if not provided
  const actualDirection = direction || (value > 0 ? "up" : value < 0 ? "down" : "stable");

  // Determine if positive if not provided
  // By default: up is positive, down is negative
  const actualIsPositive = isPositive !== undefined
    ? isPositive
    : actualDirection === "up" ? true : actualDirection === "down" ? false : undefined;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getColorClass = () => {
    if (actualDirection === "stable") {
      return "text-[color:var(--trend-stable)]";
    }
    if (actualIsPositive) {
      return "text-[color:var(--trend-positive)]";
    }
    return "text-[color:var(--trend-negative)]";
  };

  const Icon = actualDirection === "up"
    ? ArrowUp
    : actualDirection === "down"
    ? ArrowDown
    : Minus;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Icon className={cn(sizeClasses[size], getColorClass())} />
      {showValue && (
        <span className={cn(
          "font-medium",
          textSizeClasses[size],
          getColorClass()
        )}>
          {Math.abs(value).toFixed(1)}%
        </span>
      )}
      {label && (
        <span className={cn(
          "text-muted-foreground",
          textSizeClasses[size]
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

// Specialized trend indicators

export function CostTrend({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  // For cost, down is positive (lower cost is better)
  return (
    <TrendIndicator
      value={value}
      isPositive={value < 0}
      className={className}
    />
  );
}

export function PerformanceTrend({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  // For performance (latency), down is positive (lower latency is better)
  return (
    <TrendIndicator
      value={value}
      isPositive={value < 0}
      className={className}
    />
  );
}

export function AccuracyTrend({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  // For accuracy, up is positive (higher accuracy is better)
  return (
    <TrendIndicator
      value={value}
      isPositive={value > 0}
      className={className}
    />
  );
}

// Comparison indicator (comparing two runs)
export function ComparisonBadge({
  current,
  previous,
  metric,
  betterWhen = "higher",
  formatValue = (val) => val.toFixed(2),
  className,
}: {
  current: number;
  previous: number;
  metric: string;
  betterWhen?: "higher" | "lower";
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const diff = current - previous;
  const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
  const isPositive = betterWhen === "higher" ? diff > 0 : diff < 0;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-md border px-3 py-1.5",
      isPositive
        ? "border-[color:var(--trend-positive)] bg-[color:var(--status-success-bg)]"
        : "border-[color:var(--trend-negative)] bg-[color:var(--status-error-bg)]",
      className
    )}>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{metric}</span>
        <span className="text-sm font-semibold">
          {formatValue(current)}
        </span>
      </div>
      <TrendIndicator
        value={percentChange}
        isPositive={isPositive}
        size="sm"
      />
      <span className={cn(
        "text-xs",
        isPositive ? "text-[color:var(--trend-positive)]" : "text-[color:var(--trend-negative)]"
      )}>
        vs {formatValue(previous)}
      </span>
    </div>
  );
}
