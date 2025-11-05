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
