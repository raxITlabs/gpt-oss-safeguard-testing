"use client";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { extractPolicyCodes, analyzePolicyMentions } from "@/lib/policy-utils";
import type { ReasoningValidation } from "@/types/test-results";

interface PolicyHighlighterProps {
  reasoning: string;
  expectedClassification: string;
  reasoning_validation?: ReasoningValidation;
  className?: string;
}

export function PolicyHighlighter({
  reasoning,
  expectedClassification,
  reasoning_validation,
  className
}: PolicyHighlighterProps) {
  const citation = reasoning_validation?.policy_citation;

  // Use backend citation data if available, otherwise fall back to client-side analysis
  if (citation) {
    // Backend-provided policy citation analysis
    const hasCitations = citation.cited_codes.length > 0 || !citation.cited_expected;

    if (!hasCitations && citation.hallucinated_codes.length === 0) {
      return null;
    }

    return (
      <div className={className}>
        <div className="space-y-3">
          {/* Display cited codes */}
          {citation.cited_codes.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Policy Codes Cited:</p>
              <div className="flex flex-wrap gap-2">
                {citation.cited_codes.map((code) => (
                  <Badge
                    key={code}
                    variant={citation.cited_expected && code === citation.expected_code ? "default" : "secondary"}
                    className="font-mono"
                  >
                    {code}
                    {citation.cited_expected && code === citation.expected_code && " ✓"}
                  </Badge>
                ))}
              </div>
              {/* Show citation quality metrics */}
              <div className="mt-2 text-xs text-muted-foreground">
                Citation specificity: {(citation.citation_specificity * 100).toFixed(0)}%
              </div>
            </div>
          )}

          {/* Warning for hallucinated codes */}
          {citation.hallucinated_codes.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Invalid policy codes cited:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {citation.hallucinated_codes.map((code) => (
                    <Badge key={code} variant="destructive" className="font-mono">
                      {code}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs mt-2">
                  These codes do not exist in the policy. This may indicate model confusion.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning if expected code was NOT cited */}
          {!citation.cited_expected && citation.expected_code && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Expected policy code not cited:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="destructive" className="font-mono">
                    {citation.expected_code}
                  </Badge>
                </div>
                {citation.cited_level && !citation.cited_expected && (
                  <p className="text-xs mt-2">
                    Model cited correct level but different specific code
                  </p>
                )}
                {citation.cited_category && !citation.cited_level && (
                  <p className="text-xs mt-2">
                    Model cited correct category but wrong level
                  </p>
                )}
                {!citation.cited_category && (
                  <p className="text-xs mt-2">
                    Model failed to cite correct policy category
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {citation.cited_expected && (
            <Alert className="border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--status-success)]" />
              <AlertDescription className="text-[color:var(--status-success)]">
                Model correctly cited expected policy code: {citation.expected_code}
                {citation.citation_specificity === 1.0 && " (with specific subcode)"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Fallback to old client-side analysis if backend citation data not available
  const analysis = analyzePolicyMentions(reasoning, expectedClassification);
  const allCodes = extractPolicyCodes(reasoning);

  if (allCodes.length === 0 && analysis.missed.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {/* Policy codes mentioned */}
        {allCodes.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Policy Codes Mentioned:</p>
            <div className="flex flex-wrap gap-2">
              {allCodes.map((code) => (
                <Badge key={code} variant="secondary" className="font-mono">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Warning if expected code was missed */}
        {analysis.missed.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Model did not reference expected policy code:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {analysis.missed.map((code) => (
                  <Badge key={code} variant="destructive" className="font-mono">
                    {code}
                  </Badge>
                ))}
              </div>
              <p className="text-xs mt-2">
                This may indicate the model failed to apply the correct policy rule.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Success if correct code was mentioned */}
        {analysis.mentioned.some(code => analysis.shouldMention.includes(code)) && (
          <Alert className="border-[color:var(--status-success)] bg-[color:var(--status-success-bg)]">
            <CheckCircle2 className="h-4 w-4 text-[color:var(--status-success)]" />
            <AlertDescription className="text-[color:var(--status-success)]">
              Model correctly referenced expected policy code(s)
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
