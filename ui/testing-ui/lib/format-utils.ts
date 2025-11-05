/**
 * Formatting utilities for display - safe for client components
 */

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

/**
 * Format cost with adaptive precision for very small amounts
 */
export function formatCostAdaptive(amount: number): string {
  if (amount === 0) return "$0.00";

  // For costs >= $0.01, use standard formatting
  if (amount >= 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  }

  // For micro-costs ($0.001 - $0.01), show more precision
  if (amount >= 0.001) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(amount);
  }

  // For very small costs (< $0.001), show with high precision in cents
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 8
  }).format(amount);
}

/**
 * Format cost with full tooltip details
 */
export function formatCostWithTooltip(amount: number): {
  display: string;
  tooltip: string;
  scientific: string;
} {
  return {
    display: formatCostAdaptive(amount),
    tooltip: `Exact: $${amount.toFixed(8)}`,
    scientific: `${amount.toExponential(4)}`
  };
}

/**
 * Format latency for display
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get color class for test status
 * Uses CSS variables from globals.css
 */
export function getStatusColor(passed: boolean): string {
  return passed ? "text-[color:var(--status-success)]" : "text-[color:var(--status-error)]";
}

/**
 * Get badge variant for test status
 */
export function getStatusVariant(passed: boolean): "default" | "destructive" | "outline" | "secondary" {
  return passed ? "default" : "destructive";
}
