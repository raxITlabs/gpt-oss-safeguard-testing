/**
 * Comprehensive color palette for category-test_type combinations
 * Supports both baseline tests and attack scenarios
 * Now uses CSS variables from globals.css for consistent theming
 */

// Helper to get CSS variable value (for use in Recharts, etc.)
function getColor(varName: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }
  return `var(${varName})`; // SSR fallback
}

export const CATEGORY_COLORS: Record<string, string> = {
  // Baseline categories (use chart colors 1-8)
  'spam-baseline': getColor('--chart-1'),           // Primary chart color
  'hate-speech-baseline': getColor('--chart-5'),    // Amber/orange
  'violence-baseline': getColor('--chart-3'),       // Violet/purple
  'sexual-content-baseline': getColor('--chart-6'), // Pink
  'self-harm-baseline': getColor('--chart-7'),      // Teal/cyan
  'fraud-baseline': getColor('--chart-5'),          // Amber
  'illegal-activity-baseline': getColor('--chart-2'), // Indigo/blue
  'unicode-baseline': getColor('--chart-4'),        // Emerald/green
  'data-exfiltration-baseline': getColor('--chart-1'),
  'multi-policy-baseline': getColor('--chart-2'),
  'request-vs-depiction-baseline': getColor('--chart-3'),
  'risk-tiering-baseline': getColor('--chart-6'),
  'unauthorized-actions-baseline': getColor('--chart-7'),
  'prompt-injection-baseline': getColor('--priority-high'),

  // Multi-turn attacks (slightly darker variations - we'll use color-mix in future)
  'spam-multi-turn': getColor('--status-error'),
  'spam-multi_turn': getColor('--status-error'),
  'hate-speech-multi-turn': getColor('--status-warning'),
  'hate-speech-multi_turn': getColor('--status-warning'),
  'violence-multi-turn': getColor('--chart-8'),
  'violence-multi_turn': getColor('--chart-8'),
  'sexual-content-multi-turn': getColor('--chart-6'),
  'sexual-content-multi_turn': getColor('--chart-6'),
  'self-harm-multi-turn': getColor('--chart-7'),
  'self-harm-multi_turn': getColor('--chart-7'),
  'fraud-multi-turn': getColor('--status-warning'),
  'fraud-multi_turn': getColor('--status-warning'),
  'illegal-activity-multi-turn': getColor('--chart-2'),
  'illegal-activity-multi_turn': getColor('--chart-2'),
  'unicode-multi-turn': getColor('--status-success'),
  'unicode-multi_turn': getColor('--status-success'),
  'data-exfiltration-multi-turn': getColor('--status-error'),
  'data-exfiltration-multi_turn': getColor('--status-error'),
  'multi-policy-multi-turn': getColor('--chart-2'),
  'multi-policy-multi_turn': getColor('--chart-2'),
  'request-vs-depiction-multi-turn': getColor('--chart-8'),
  'request-vs-depiction-multi_turn': getColor('--chart-8'),
  'risk-tiering-multi-turn': getColor('--chart-6'),
  'risk-tiering-multi_turn': getColor('--chart-6'),
  'unauthorized-actions-multi-turn': getColor('--chart-7'),
  'unauthorized-actions-multi_turn': getColor('--chart-7'),
  'prompt-injection-multi-turn': getColor('--priority-high'),
  'prompt-injection-multi_turn': getColor('--priority-high'),

  // Prompt injection attacks (critical/error tones - kept for backward compatibility)
  'spam-prompt-injection': getColor('--priority-high'),
  'spam-prompt_injection': getColor('--priority-high'),
  'hate-speech-prompt-injection': getColor('--priority-medium'),
  'hate-speech-prompt_injection': getColor('--priority-medium'),
  'violence-prompt-injection': getColor('--chart-3'),
  'violence-prompt_injection': getColor('--chart-3'),
  'sexual-content-prompt-injection': getColor('--chart-6'),
  'sexual-content-prompt_injection': getColor('--chart-6'),
  'self-harm-prompt-injection': getColor('--chart-7'),
  'self-harm-prompt_injection': getColor('--chart-7'),
  'fraud-prompt-injection': getColor('--priority-medium'),
  'fraud-prompt_injection': getColor('--priority-medium'),
  'illegal-activity-prompt-injection': getColor('--chart-2'),
  'illegal-activity-prompt_injection': getColor('--chart-2'),
  'unicode-prompt-injection': getColor('--chart-4'),
  'unicode-prompt_injection': getColor('--chart-4'),
  'data-exfiltration-prompt-injection': getColor('--priority-high'),
  'data-exfiltration-prompt_injection': getColor('--priority-high'),
  'multi-policy-prompt-injection': getColor('--chart-2'),
  'multi-policy-prompt_injection': getColor('--chart-2'),
  'request-vs-depiction-prompt-injection': getColor('--chart-3'),
  'request-vs-depiction-prompt_injection': getColor('--chart-3'),
  'risk-tiering-prompt-injection': getColor('--chart-6'),
  'risk-tiering-prompt_injection': getColor('--chart-6'),
  'unauthorized-actions-prompt-injection': getColor('--chart-7'),
  'unauthorized-actions-prompt_injection': getColor('--chart-7'),

  // Over-refusal tests (use status info for distinction)
  'spam-over-refusal': getColor('--status-info'),
  'spam-over_refusal': getColor('--status-info'),
  'hate-speech-over-refusal': getColor('--status-info'),
  'hate-speech-over_refusal': getColor('--status-info'),
  'violence-over-refusal': getColor('--status-info'),
  'violence-over_refusal': getColor('--status-info'),
  'sexual-content-over-refusal': getColor('--status-info'),
  'sexual-content-over_refusal': getColor('--status-info'),
  'self-harm-over-refusal': getColor('--status-info'),
  'self-harm-over_refusal': getColor('--status-info'),
  'fraud-over-refusal': getColor('--status-info'),
  'fraud-over_refusal': getColor('--status-info'),
  'illegal-activity-over-refusal': getColor('--status-info'),
  'illegal-activity-over_refusal': getColor('--status-info'),
  'unicode-over-refusal': getColor('--status-info'),
  'unicode-over_refusal': getColor('--status-info'),
  'data-exfiltration-over-refusal': getColor('--status-info'),
  'data-exfiltration-over_refusal': getColor('--status-info'),
  'multi-policy-over-refusal': getColor('--status-info'),
  'multi-policy-over_refusal': getColor('--status-info'),
  'request-vs-depiction-over-refusal': getColor('--status-info'),
  'request-vs-depiction-over_refusal': getColor('--status-info'),
  'risk-tiering-over-refusal': getColor('--status-info'),
  'risk-tiering-over_refusal': getColor('--status-info'),
  'unauthorized-actions-over-refusal': getColor('--status-info'),
  'unauthorized-actions-over_refusal': getColor('--status-info'),
  'prompt-injection-over-refusal': getColor('--status-info'),
  'prompt-injection-over_refusal': getColor('--status-info'),

  // Legacy/backward compatibility (category only, no test type)
  'spam': getColor('--chart-1'),
  'hate-speech': getColor('--chart-5'),
  'violence': getColor('--chart-3'),
  'sexual-content': getColor('--chart-6'),
  'self-harm': getColor('--chart-7'),
  'fraud': getColor('--chart-5'),
  'illegal-activity': getColor('--chart-2'),
  'unicode': getColor('--chart-4'),
  'data-exfiltration': getColor('--chart-1'),
  'multi-policy': getColor('--chart-2'),
  'request-vs-depiction': getColor('--chart-3'),
  'risk-tiering': getColor('--chart-6'),
  'unauthorized-actions': getColor('--chart-7'),
  'prompt-injection': getColor('--priority-high'),

  // Unknown/fallback
  'unknown-baseline': getColor('--muted-foreground'),
  'unknown': getColor('--muted-foreground'),
  'Unknown': getColor('--muted-foreground'),
};

/**
 * Get color for a given category and test type
 * @param category - Content category (spam, hate-speech, etc.)
 * @param testType - Test type (baseline, multi-turn, prompt-injection, etc.)
 * @returns Hex color string
 */
export function getCategoryColor(category: string | null | undefined, testType: string | null | undefined): string {
  // Handle null/undefined inputs
  const cat = category || 'unknown';
  const type = testType || 'baseline';

  // Try composite key first (e.g., "spam-multi-turn")
  const compositeKey = `${cat}-${type}`;
  if (CATEGORY_COLORS[compositeKey]) {
    return CATEGORY_COLORS[compositeKey];
  }

  // Fallback to category only
  if (CATEGORY_COLORS[cat]) {
    return CATEGORY_COLORS[cat];
  }

  // Final fallback
  return getColor('--muted-foreground');
}

/**
 * Get display label for category and test type
 * @param category - Content category
 * @param testType - Test type
 * @returns Human-readable label (e.g., "Spam (Multi-turn)")
 */
export function getCategoryDisplayLabel(category: string | null | undefined, testType: string | null | undefined): string {
  const cat = category || 'unknown';
  const type = testType || 'baseline';

  // Capitalize category
  const catLabel = cat
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // For baseline, just return category
  if (type === 'baseline') {
    return catLabel;
  }

  // For attack scenarios, return "Category (Attack Type)"
  const typeLabel = type
    .replace(/_/g, '-') // normalize underscores to hyphens
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${catLabel} (${typeLabel})`;
}

/**
 * Get short display label for category and test type (for compact displays)
 * @param category - Content category
 * @param testType - Test type
 * @returns Short label (e.g., "Spam-MT")
 */
export function getCategoryShortLabel(category: string | null | undefined, testType: string | null | undefined): string {
  const cat = category || 'unknown';
  const type = testType || 'baseline';

  // Abbreviate category
  const catAbbrev = cat
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  // For baseline, just return category abbreviation
  if (type === 'baseline') {
    return catAbbrev;
  }

  // Abbreviate attack type
  const typeAbbrev = type
    .replace(/_/g, '-')
    .split('-')
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return `${catAbbrev}-${typeAbbrev}`;
}

/**
 * Check if a test is an attack scenario
 */
export function isAttackScenario(testType: string | null | undefined): boolean {
  if (!testType) return false;
  return testType !== 'baseline' && testType !== null;
}

/**
 * Get all available categories
 */
export const ALL_CATEGORIES = [
  'spam',
  'hate-speech',
  'violence',
  'sexual-content',
  'self-harm',
  'fraud',
  'illegal-activity',
  'unicode',
  'data-exfiltration',
  'multi-policy',
  'request-vs-depiction',
  'risk-tiering',
  'unauthorized-actions',
  'prompt-injection',
] as const;

/**
 * Get all available test types
 */
export const ALL_TEST_TYPES = [
  'baseline',
  'multi-turn',
  'multi_turn',
  'over-refusal',
  'over_refusal',
] as const;
