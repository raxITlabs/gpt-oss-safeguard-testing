/**
 * Enhanced metric card component with threshold indicators and trends
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number; // Percentage change
    direction: "up" | "down" | "stable";
    isPositive?: boolean; // Whether the trend direction is good
  };
  threshold?: {
    value: number;
    comparison: "above" | "below";
    met: boolean;
  };
  status?: "excellent" | "good" | "warning" | "critical";
  className?: string;
  size?: "default" | "large";
  description?: string;
  onClick?: () => void;
}

const statusColors = {
  excellent: "border-[color:var(--status-success)] border-l-4 bg-gradient-to-r from-[color:var(--status-success-bg)]/5 via-transparent to-transparent",
  good: "border-[color:var(--sla-good)] border-l-4 bg-gradient-to-r from-[color:var(--status-info-bg)]/5 via-transparent to-transparent",
  warning: "border-[color:var(--status-warning)] border-l-4 bg-gradient-to-r from-[color:var(--status-warning-bg)]/5 via-transparent to-transparent",
  critical: "border-[color:var(--status-error)] border-l-4 bg-gradient-to-r from-[color:var(--status-error-bg)]/5 via-transparent to-transparent",
};

const statusIcons = {
  excellent: CheckCircle2,
  good: CheckCircle2,
  warning: AlertCircle,
  critical: AlertCircle,
};

const statusIconColors = {
  excellent: "text-[color:var(--status-success)]",
  good: "text-[color:var(--sla-good)]",
  warning: "text-[color:var(--status-warning)]",
  critical: "text-[color:var(--status-error)]",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  threshold,
  status,
  className,
  size = "default",
  description,
  onClick,
}: MetricCardProps) {
  const StatusIcon = status ? statusIcons[status] : null;
  const statusColor = status ? statusColors[status] : "";
  const statusIconColor = status ? statusIconColors[status] : "";

  const getTrendIcon = () => {
    if (!trend) return null;

    const iconClass = cn(
      "h-3 w-3",
      trend.isPositive
        ? "text-[color:var(--trend-positive)]"
        : "text-[color:var(--trend-negative)]"
    );

    if (trend.direction === "up") {
      return <ArrowUp className={iconClass} />;
    } else if (trend.direction === "down") {
      return <ArrowDown className={iconClass} />;
    } else {
      return <Minus className="h-3 w-3 text-[color:var(--trend-stable)]" />;
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 py-2 gap-2",
        status && statusColor,
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn("pb-1 px-3 pt-3")}>
        <div className="flex items-start justify-between">
          <CardTitle className={cn(
            "text-[10px] sm:text-xs font-medium text-muted-foreground leading-none",
            size === "large" && "text-xs sm:text-sm"
          )}>
            {title}
          </CardTitle>
          {(icon || StatusIcon) && (
            <div className="flex items-center gap-1.5">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              {StatusIcon && <StatusIcon className={cn("h-3 w-3", statusIconColor)} />}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("px-3 pt-0 pb-3")}>
        <div className="space-y-1">
          {/* Main Value */}
          <div className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight leading-none",
            size === "large" && "text-2xl sm:text-3xl"
          )}>
            {value}
          </div>

          {/* Subtitle or Trend */}
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              {trend && (
                <div className="flex items-center gap-0.5">
                  {getTrendIcon()}
                  <span className={cn(
                    "font-medium leading-none",
                    trend.isPositive
                      ? "text-[color:var(--trend-positive)]"
                      : "text-[color:var(--trend-negative)]"
                  )}>
                    {Math.abs(trend.value).toFixed(1)}%
                  </span>
                </div>
              )}
              {subtitle && (
                <span className="text-muted-foreground leading-none">{subtitle}</span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              {description}
            </p>
          )}

          {/* Threshold Indicator */}
          {threshold && (
            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                threshold.met ? "bg-[color:var(--status-success)]" : "bg-[color:var(--status-error)]"
              )} />
              <span className="text-muted-foreground leading-none">
                Target: {threshold.comparison === "above" ? ">" : "<"} {threshold.value}
              </span>
              <span className={cn(
                "font-medium leading-none",
                threshold.met ? "text-[color:var(--status-success)]" : "text-[color:var(--status-error)]"
              )}>
                {threshold.met ? "Met" : "Not Met"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized metric cards

export function PassRateMetricCard({
  passRate,
  totalTests,
  target = 95,
  className,
}: {
  passRate: number;
  totalTests: number;
  target?: number;
  className?: string;
}) {
  const getStatus = (): "excellent" | "good" | "warning" | "critical" => {
    if (passRate >= target) return "excellent";
    if (passRate >= target - 5) return "good";
    if (passRate >= target - 10) return "warning";
    return "critical";
  };

  return (
    <MetricCard
      title="Pass Rate"
      value={`${passRate.toFixed(1)}%`}
      subtitle={`${totalTests} total tests`}
      status={getStatus()}
      threshold={{
        value: target,
        comparison: "above",
        met: passRate >= target,
      }}
      icon={<TrendingUp className="h-4 w-4" />}
      size="large"
      className={className}
    />
  );
}

export function CostMetricCard({
  avgCost,
  totalCost,
  budgetLimit,
  className,
}: {
  avgCost: number;
  totalCost: number;
  budgetLimit?: number;
  className?: string;
}) {
  const formatCost = (cost: number) => {
    if (cost < 0.001) return `$${(cost * 1000000).toFixed(2)}µ`;
    if (cost < 1) return `$${(cost * 1000).toFixed(4)}m`;
    return `$${cost.toFixed(2)}`;
  };

  const status = budgetLimit && totalCost > budgetLimit ? "warning" : undefined;

  return (
    <MetricCard
      title="Average Cost"
      value={formatCost(avgCost)}
      subtitle={`${formatCost(totalCost)} total`}
      status={status}
      threshold={budgetLimit ? {
        value: budgetLimit,
        comparison: "below",
        met: totalCost <= budgetLimit,
      } : undefined}
      className={className}
    />
  );
}

export function LatencyMetricCard({
  avgLatency,
  p95Latency,
  slaThreshold = 1000,
  className,
}: {
  avgLatency: number;
  p95Latency?: number;
  slaThreshold?: number;
  className?: string;
}) {
  const getStatus = (): "excellent" | "good" | "warning" | "critical" | undefined => {
    if (!p95Latency) return undefined;
    if (p95Latency <= slaThreshold * 0.7) return "excellent";
    if (p95Latency <= slaThreshold) return "good";
    if (p95Latency <= slaThreshold * 1.2) return "warning";
    return "critical";
  };

  return (
    <MetricCard
      title="Average Latency"
      value={`${Math.round(avgLatency)}ms`}
      subtitle={p95Latency ? `P95: ${Math.round(p95Latency)}ms` : undefined}
      status={getStatus()}
      threshold={p95Latency ? {
        value: slaThreshold,
        comparison: "below",
        met: p95Latency <= slaThreshold,
      } : undefined}
      className={className}
    />
  );
}
