"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface AggregatedMetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "stable";
    value: string | number;
    label?: string;
    isPositive?: boolean; // Whether the trend direction is good
  };
  footer?: {
    primary: string;
    secondary: string;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  status?: "excellent" | "good" | "warning" | "critical";
  threshold?: {
    value: number;
    comparison: "above" | "below";
    met: boolean;
  };
  size?: "default" | "large";
  description?: string;
  onClick?: () => void;
  className?: string;
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

export function AggregatedMetricsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  footer,
  variant = "default",
  status,
  threshold,
  size = "default",
  description,
  onClick,
  className,
}: AggregatedMetricsCardProps) {
  const StatusIcon = status ? statusIcons[status] : null;
  const statusColor = status ? statusColors[status] : "";

  const getBadgeVariant = () => {
    if (status === "excellent") return "default";
    if (status === "good") return "outline";
    if (status === "warning") return "secondary";
    if (status === "critical") return "destructive";
    if (variant === "success") return "default";
    if (variant === "warning") return "secondary";
    if (variant === "destructive") return "destructive";
    return "outline";
  };

  return (
    <Card className={cn(
      "@container/card from-primary/5 to-card dark:to-card bg-gradient-to-t shadow-xs transition-all duration-200",
      status && statusColor,
      onClick && "cursor-pointer hover:shadow-lg",
      className
    )}
    onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardDescription className={cn(
            size === "large" && "text-sm"
          )}>
            {title}
          </CardDescription>
          {(icon || StatusIcon) && (
            <div className="flex items-center gap-1.5">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              {StatusIcon && <StatusIcon className="h-3 w-3 text-muted-foreground" />}
            </div>
          )}
        </div>

        <CardTitle className={cn(
          "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          size === "large" && "text-3xl @[250px]/card:text-4xl"
        )}>
          {value}
        </CardTitle>

        {subtitle && !trend && (
          <div className="text-xs text-muted-foreground">
            {subtitle}
          </div>
        )}

        {trend && (
          <CardAction>
            <Badge variant={getBadgeVariant()}>
              {trend.direction === "up" ? <IconTrendingUp className="h-3 w-3" /> :
               trend.direction === "down" ? <IconTrendingDown className="h-3 w-3" /> : null}
              {trend.label || trend.value}
            </Badge>
          </CardAction>
        )}

        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}

        {threshold && (
          <div className="flex items-center gap-1.5 text-xs mt-2">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              threshold.met ? "bg-[color:var(--status-success)]" : "bg-[color:var(--status-error)]"
            )} />
            <span className="text-muted-foreground">
              Target: {threshold.comparison === "above" ? ">" : "<"} {threshold.value}
            </span>
            <span className="font-medium text-foreground">
              {threshold.met ? "Met" : "Not Met"}
            </span>
          </div>
        )}
      </CardHeader>

      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {footer.primary}{" "}
            {trend?.direction === "up" ? (
              <IconTrendingUp className="size-4" />
            ) : trend?.direction === "down" ? (
              <IconTrendingDown className="size-4" />
            ) : null}
          </div>
          <div className="text-muted-foreground">{footer.secondary}</div>
        </CardFooter>
      )}
    </Card>
  );
}
