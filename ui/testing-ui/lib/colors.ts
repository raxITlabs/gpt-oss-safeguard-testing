/**
 * Color Utilities
 *
 * Provides functions to access CSS variables defined in globals.css
 * Ensures consistent color usage across the application and supports theme switching
 */

/**
 * Get a CSS variable value from the document root
 * Works in browser context only
 */
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback - return the variable name for SSR
    return `var(${variable})`;
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Chart colors for Recharts components
 * Returns array of color values from CSS variables
 */
export function getChartColors(count: number = 8): string[] {
  const colors: string[] = [];
  for (let i = 1; i <= Math.min(count, 8); i++) {
    colors.push(getCSSVariable(`--chart-${i}`));
  }
  return colors;
}

/**
 * Status color mappings
 */
export const StatusColors = {
  success: {
    foreground: () => getCSSVariable('--status-success'),
    background: () => getCSSVariable('--status-success-bg'),
  },
  warning: {
    foreground: () => getCSSVariable('--status-warning'),
    background: () => getCSSVariable('--status-warning-bg'),
  },
  error: {
    foreground: () => getCSSVariable('--status-error'),
    background: () => getCSSVariable('--status-error-bg'),
  },
  info: {
    foreground: () => getCSSVariable('--status-info'),
    background: () => getCSSVariable('--status-info-bg'),
  },
} as const;

/**
 * Priority level color mappings
 */
export const PriorityColors = {
  high: {
    foreground: () => getCSSVariable('--priority-high'),
    background: () => getCSSVariable('--priority-high-bg'),
  },
  medium: {
    foreground: () => getCSSVariable('--priority-medium'),
    background: () => getCSSVariable('--priority-medium-bg'),
  },
  low: {
    foreground: () => getCSSVariable('--priority-low'),
    background: () => getCSSVariable('--priority-low-bg'),
  },
} as const;

/**
 * SLA zone color mappings
 */
export const SLAColors = {
  excellent: () => getCSSVariable('--sla-excellent'),
  good: () => getCSSVariable('--sla-good'),
  warning: () => getCSSVariable('--sla-warning'),
  critical: () => getCSSVariable('--sla-critical'),
} as const;

/**
 * Trend indicator colors
 */
export const TrendColors = {
  positive: () => getCSSVariable('--trend-positive'),
  negative: () => getCSSVariable('--trend-negative'),
  stable: () => getCSSVariable('--trend-stable'),
} as const;

/**
 * Zone/Quadrant color mappings (for scatter plots)
 */
export const ZoneColors = {
  ideal: {
    foreground: () => getCSSVariable('--zone-ideal'),
    background: () => getCSSVariable('--zone-ideal-bg'),
  },
  premium: {
    foreground: () => getCSSVariable('--zone-premium'),
    background: () => getCSSVariable('--zone-premium-bg'),
  },
  acceptable: {
    foreground: () => getCSSVariable('--zone-acceptable'),
    background: () => getCSSVariable('--zone-acceptable-bg'),
  },
  avoid: {
    foreground: () => getCSSVariable('--zone-avoid'),
    background: () => getCSSVariable('--zone-avoid-bg'),
  },
} as const;

/**
 * Category colors for test types
 * Maps category names to chart colors cyclically
 */
export function getCategoryColor(category: string, index: number = 0): string {
  // Use chart colors in rotation
  const chartColorIndex = (index % 8) + 1;
  return getCSSVariable(`--chart-${chartColorIndex}`);
}

/**
 * Extended color palette for categories with 8+ distinct values
 * Returns an array of colors suitable for category-based visualizations
 */
export function getCategoryColorPalette(): string[] {
  return getChartColors(8);
}

/**
 * Tailwind-compatible class names for status colors
 */
export const StatusClasses = {
  success: {
    text: 'text-[color:var(--status-success)]',
    bg: 'bg-[color:var(--status-success-bg)]',
    border: 'border-[color:var(--status-success)]',
  },
  warning: {
    text: 'text-[color:var(--status-warning)]',
    bg: 'bg-[color:var(--status-warning-bg)]',
    border: 'border-[color:var(--status-warning)]',
  },
  error: {
    text: 'text-[color:var(--status-error)]',
    bg: 'bg-[color:var(--status-error-bg)]',
    border: 'border-[color:var(--status-error)]',
  },
  info: {
    text: 'text-[color:var(--status-info)]',
    bg: 'bg-[color:var(--status-info-bg)]',
    border: 'border-[color:var(--status-info)]',
  },
} as const;

/**
 * Tailwind-compatible class names for priority levels
 */
export const PriorityClasses = {
  high: {
    text: 'text-[color:var(--priority-high)]',
    bg: 'bg-[color:var(--priority-high-bg)]',
    border: 'border-[color:var(--priority-high)]',
  },
  medium: {
    text: 'text-[color:var(--priority-medium)]',
    bg: 'bg-[color:var(--priority-medium-bg)]',
    border: 'border-[color:var(--priority-medium)]',
  },
  low: {
    text: 'text-[color:var(--priority-low)]',
    bg: 'bg-[color:var(--priority-low-bg)]',
    border: 'border-[color:var(--priority-low)]',
  },
} as const;

/**
 * Tailwind-compatible class names for trend indicators
 */
export const TrendClasses = {
  positive: 'text-[color:var(--trend-positive)]',
  negative: 'text-[color:var(--trend-negative)]',
  stable: 'text-[color:var(--trend-stable)]',
} as const;

/**
 * Tailwind-compatible class names for zone/quadrant backgrounds
 */
export const ZoneClasses = {
  ideal: {
    text: 'text-[color:var(--zone-ideal)]',
    bg: 'bg-[color:var(--zone-ideal-bg)]',
    border: 'border-[color:var(--zone-ideal)]',
  },
  premium: {
    text: 'text-[color:var(--zone-premium)]',
    bg: 'bg-[color:var(--zone-premium-bg)]',
    border: 'border-[color:var(--zone-premium)]',
  },
  acceptable: {
    text: 'text-[color:var(--zone-acceptable)]',
    bg: 'bg-[color:var(--zone-acceptable-bg)]',
    border: 'border-[color:var(--zone-acceptable)]',
  },
  avoid: {
    text: 'text-[color:var(--zone-avoid)]',
    bg: 'bg-[color:var(--zone-avoid-bg)]',
    border: 'border-[color:var(--zone-avoid)]',
  },
} as const;
