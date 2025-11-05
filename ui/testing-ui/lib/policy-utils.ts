/**
 * Utilities for extracting and parsing policy information from test data
 */

import type { InferenceEvent } from "@/types/test-results";

export interface PolicyInfo {
  fullText: string;
  title: string;
  code: string; // e.g., "SP", "UC", "HS"
  goal: string;
  sections: PolicySection[];
}

export interface PolicySection {
  code: string; // e.g., "SP0", "SP2.a"
  level: string; // e.g., "SP0", "SP2"
  description: string;
  examples?: string[];
}

/**
 * Extract policy from inference event
 */
export function extractPolicy(inference: InferenceEvent): string | null {
  const systemMessage = inference.request.messages.find(m => m.role === "system");
  return systemMessage?.content || null;
}

/**
 * Parse policy text into structured format
 */
export function parsePolicy(policyText: string): PolicyInfo {
  const lines = policyText.split("\n");

  // Extract title and code (first line usually)
  const titleMatch = policyText.match(/^(.+?Policy\s*\(#(\w+)\))/);
  const title = titleMatch ? titleMatch[1].trim() : "Policy";
  const code = titleMatch ? titleMatch[2] : "";

  // Extract goal
  const goalMatch = policyText.match(/GOAL:\s*(.+?)(?:\n|$)/i);
  const goal = goalMatch ? goalMatch[1].trim() : "";

  // Parse sections (SP0, SP2.a, etc.)
  const sections: PolicySection[] = [];
  const sectionRegex = /(?:^|\n)([A-Z]{2,}\d+(?:\.[a-z])?)[:\s-]+(.+?)(?=(?:\n[A-Z]{2,}\d+|$))/gs;

  let match;
  while ((match = sectionRegex.exec(policyText)) !== null) {
    const sectionCode = match[1].trim();
    const description = match[2].trim();

    // Extract level (e.g., "SP0" from "SP0.a")
    const levelMatch = sectionCode.match(/^([A-Z]{2,}\d+)/);
    const level = levelMatch ? levelMatch[1] : sectionCode;

    // Extract examples if present
    const examples: string[] = [];
    const exampleMatches = description.matchAll(/["'](.+?)["']/g);
    for (const em of exampleMatches) {
      examples.push(em[1]);
    }

    sections.push({
      code: sectionCode,
      level,
      description,
      examples: examples.length > 0 ? examples : undefined
    });
  }

  return {
    fullText: policyText,
    title,
    code,
    goal,
    sections
  };
}

/**
 * Extract policy codes mentioned in text (e.g., "SP0.g", "UC2")
 */
export function extractPolicyCodes(text: string): string[] {
  const codePattern = /\b([A-Z]{2,}\d+(?:\.[a-z])?)\b/g;
  const matches = text.matchAll(codePattern);
  const codes = new Set<string>();

  for (const match of matches) {
    codes.add(match[1]);
  }

  return Array.from(codes);
}

/**
 * Highlight policy codes in text with HTML markers
 */
export function highlightPolicyCodes(text: string): string {
  return text.replace(
    /\b([A-Z]{2,}\d+(?:\.[a-z])?)\b/g,
    '<mark class="policy-code">$1</mark>'
  );
}

/**
 * Get policy category from code
 */
export function getPolicyCategory(code: string): string {
  const categoryMap: Record<string, string> = {
    'SP': 'Spam',
    'HS': 'Hate Speech',
    'VI': 'Violence',
    'SC': 'Sexual Content',
    'SH': 'Self-Harm',
    'FR': 'Fraud',
    'IA': 'Illegal Activity',
    'UC': 'Unicode Smuggling'
  };

  const prefixMatch = code.match(/^([A-Z]{2,})/);
  const prefix = prefixMatch ? prefixMatch[1] : null;
  return prefix ? (categoryMap[prefix] || prefix) : code;
}

/**
 * Get severity level from policy code
 */
export function getSeverityLevel(code: string): { level: number; label: string; color: string } {
  const numberMatch = code.match(/(\d+)/);
  const level = numberMatch ? parseInt(numberMatch[1]) : 0;

  if (level === 0) {
    return { level: 0, label: 'Allowed / Low Confidence', color: 'green' };
  } else if (level <= 2) {
    return { level, label: 'Low Severity', color: 'yellow' };
  } else if (level <= 3) {
    return { level, label: 'Medium Severity', color: 'orange' };
  } else {
    return { level, label: 'High Severity', color: 'red' };
  }
}

/**
 * Compare policy codes mentioned in reasoning vs expected
 *
 * @deprecated This function is deprecated and should not be used in new code.
 * Instead, use the backend-provided policy_citation object from reasoning_validation.
 * This function is kept for backward compatibility with old logs that don't have
 * backend citation analysis.
 *
 * Known issues:
 * - May incorrectly treat classification outputs ("VALID"/"INVALID") as policy codes
 * - Less accurate than backend analysis which validates against actual policy
 * - Does not detect hallucinated policy codes
 *
 * Migration: Use reasoning_validation.policy_citation instead
 */
export function analyzePolicyMentions(
  reasoning: string,
  expectedCode: string
): {
  mentioned: string[];
  shouldMention: string[];
  missed: string[];
} {
  const mentioned = extractPolicyCodes(reasoning);
  const shouldMention = [expectedCode];

  // Extract base level (e.g., "SP2" from "SP2.a")
  const expectedBaseMatch = expectedCode.match(/^([A-Z]{2,}\d+)/);
  const expectedBase = expectedBaseMatch ? expectedBaseMatch[1] : null;
  if (expectedBase && expectedBase !== expectedCode) {
    shouldMention.push(expectedBase);
  }

  const missed = shouldMention.filter(code => !mentioned.includes(code));

  return {
    mentioned,
    shouldMention,
    missed
  };
}

/**
 * Format policy for display (add proper line breaks, sections)
 */
export function formatPolicyDisplay(policyText: string): string {
  return policyText
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .replace(/^([A-Z]{2,}\d+(?:\.[a-z])?)[:\s-]/gm, '\n$1: ') // Format section headers
    .trim();
}
