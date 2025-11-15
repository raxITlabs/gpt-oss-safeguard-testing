"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InferenceEvent } from "@/types/test-results"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { CollapsibleSection } from "@/components/ui/collapsible-section"
import { useSettings } from "@/contexts/settings-context"
import { analyzeFailure } from "@/lib/failure-analyzer"

interface TestDetailCardProps {
  test: InferenceEvent
  className?: string
}

export function TestDetailCard({ test, className }: TestDetailCardProps) {
  const { strictPolicyValidation } = useSettings()
  const passed = analyzeFailure(test, strictPolicyValidation) === null
  const latency = test.latency_ms ?? test.metrics?.latency_ms
  const cost = test.cost_usd ?? test.metrics?.cost_usd
  const tokens = test.tokens ?? {
    prompt: test.usage?.prompt_tokens ?? 0,
    completion: test.usage?.completion_tokens ?? 0,
    total: test.usage?.total_tokens ?? 0,
  }

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
    }).format(value)
  }

  const getStatusColor = (passed: boolean | undefined) => {
    if (passed === undefined) return "bg-muted text-muted-foreground"
    return passed
      ? "bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] border-[color:var(--status-success)]"
      : "bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] border-[color:var(--status-error)]"
  }

  const getQualityColor = (score: number) => {
    if (score >= 81) return "text-[color:var(--status-success)]"
    if (score >= 61) return "text-[color:var(--status-info)]"
    if (score >= 31) return "text-[color:var(--status-warning)]"
    return "text-[color:var(--status-error)]"
  }

  const getQualityLabel = (score: number) => {
    if (score >= 81) return "Excellent"
    if (score >= 61) return "Good"
    if (score >= 31) return "Fair"
    return "Poor"
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Status */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {test.test_name || test.test_id || `Test #${test.test_number}`}
              </h2>
              <Badge className={cn("border", getStatusColor(passed))}>
                {passed ? "Passed" : "Failed"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Model: {test.request.model}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Category: {test.category || "N/A"}</span>
              {test.test_type && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Type: {test.test_type}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right text-sm space-y-0.5">
            <div className="text-muted-foreground">
              {new Date(test.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Performance Metrics
          <InfoTooltip content="Latency and cost metrics for this test execution" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Latency</div>
            <div className="text-lg font-semibold text-foreground">
              {latency ? `${latency.toFixed(0)}ms` : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Cost</div>
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(cost)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Tokens</div>
            <div className="text-lg font-semibold text-foreground">
              {tokens.total.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {tokens.prompt} / {tokens.completion}
            </div>
          </div>
          {test.reasoning_validation && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                Reasoning Quality
              </div>
              <div className={cn("text-lg font-semibold", getQualityColor(test.reasoning_validation.quality_score))}>
                {getQualityLabel(test.reasoning_validation.quality_score)}
              </div>
              <div className="text-xs text-muted-foreground">
                Score: {test.reasoning_validation.quality_score}/100
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Request & Response */}
      <CollapsibleSection
        title="Request & Response"
        description="Full conversation messages"
        defaultOpen={true}
      >
        <div className="space-y-3">
          {test.request.messages.map((msg, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase">
                {msg.role}
              </div>
              <div className="text-sm text-foreground bg-muted/50 p-3 rounded border border-border">
                {msg.content}
              </div>
            </div>
          ))}

          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase">
              Assistant Response
            </div>
            <div className="text-sm text-foreground bg-muted/50 p-3 rounded border border-border">
              {test.response.content || test.content}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Test Results */}
      {test.test_result && (
        <CollapsibleSection
          title="Test Results"
          description="Expected vs actual classification"
          defaultOpen={true}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Expected</div>
              <div className="text-sm text-foreground bg-[color:var(--status-success-bg)] p-3 rounded border border-[color:var(--status-success)]">
                {test.test_result.expected}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Actual</div>
              <div className={cn(
                "text-sm text-foreground p-3 rounded border",
                passed
                  ? "bg-[color:var(--status-success-bg)] border-[color:var(--status-success)]"
                  : "bg-[color:var(--status-error-bg)] border-[color:var(--status-error)]"
              )}>
                {test.test_result.actual}
              </div>
            </div>
          </div>

          {test.test_result.reasoning && (
            <div className="mt-3 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Reasoning</div>
              <div className="text-sm text-foreground bg-muted/50 p-3 rounded border border-border">
                {test.test_result.reasoning}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Reasoning Validation */}
      {test.reasoning_validation && (
        <CollapsibleSection
          title="Reasoning Validation"
          description="Quality analysis of the model's reasoning"
          defaultOpen={false}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Has Reasoning</div>
                <div className="text-sm font-medium">
                  {test.reasoning_validation.has_reasoning ? "Yes" : "No"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Length</div>
                <div className="text-sm font-medium">
                  {test.reasoning_validation.reasoning_length} chars
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Mentions Policy</div>
                <div className="text-sm font-medium">
                  {test.reasoning_validation.mentions_policy ? "Yes" : "No"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Mentions Severity</div>
                <div className="text-sm font-medium">
                  {test.reasoning_validation.mentions_severity ? "Yes" : "No"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Mentions Category</div>
                <div className="text-sm font-medium">
                  {test.reasoning_validation.mentions_category ? "Yes" : "No"}
                </div>
              </div>
            </div>

            {test.reasoning_validation.policy_citation && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-semibold text-foreground">Policy Citations</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Cited Codes</div>
                    <div className="flex flex-wrap gap-1">
                      {test.reasoning_validation.policy_citation.cited_codes.length > 0 ? (
                        test.reasoning_validation.policy_citation.cited_codes.map((code, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Expected Code</div>
                    <Badge variant="secondary">
                      {test.reasoning_validation.policy_citation.expected_code}
                    </Badge>
                  </div>
                </div>
                {test.reasoning_validation.policy_citation.hallucinated_codes.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Hallucinated Codes</div>
                    <div className="flex flex-wrap gap-1">
                      {test.reasoning_validation.policy_citation.hallucinated_codes.map((code, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  )
}
