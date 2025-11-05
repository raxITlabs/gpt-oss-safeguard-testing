"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, MessageSquare, Bot, Brain, Zap, DollarSign, Clock } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { StatusBadge } from "./status-badge";
import { PolicyViewer } from "./policy-viewer";
import { PolicyHighlighter } from "./policy-highlighter";
import { TokenBreakdown } from "./token-breakdown";
import { CostDisplay } from "./cost-display";
import { extractPolicy } from "@/lib/policy-utils";
import { analyzeFailure } from "@/lib/failure-analyzer";
import { formatLatency } from "@/lib/format-utils";

function getQualityScoreColor(score: number): string {
  if (score >= 80) return "text-[color:var(--status-success)]";
  if (score >= 60) return "text-[color:var(--status-info)]";
  if (score >= 40) return "text-[color:var(--status-warning)]";
  return "text-[color:var(--status-error)]";
}

interface TestDetailsDialogProps {
  test: InferenceEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strictPolicyValidation?: boolean;
}

export function TestDetailsDialog({ test, open, onOpenChange, strictPolicyValidation = true }: TestDetailsDialogProps) {
  if (!test) return null;

  const policyText = extractPolicy(test);
  const userMessage = test.request.messages.find(m => m.role === "user")?.content || "N/A";
  const isPassed = analyzeFailure(test, strictPolicyValidation) === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span>Test #{test.test_number || "N/A"}{test.test_name ? `: ${test.test_name}` : ""}</span>
            <StatusBadge passed={isPassed} />
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span className="text-xs">{new Date(test.timestamp).toLocaleString()}</span>
            <span className="flex items-center gap-3 text-xs">
              <span>Expected: <Badge variant="outline" className="text-xs">{test.test_result?.expected ?? "N/A"}</Badge></span>
              <span>Actual: <Badge variant="outline" className="text-xs">{test.test_result?.actual ?? "N/A"}</Badge></span>
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Two-column layout: tabs on left, metrics on right (desktop), stacked on mobile */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-3 mt-3 min-h-0">
          {/* LEFT COLUMN: Tabs (60% on desktop) */}
          <div className="flex-1 lg:w-3/5 overflow-hidden flex flex-col lg:border-r lg:pr-4 h-full">
            <Tabs defaultValue="policy" className="flex-1 flex flex-col overflow-hidden h-full">
              <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="policy" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Policy
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Input
            </TabsTrigger>
            <TabsTrigger value="output" className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              Output
            </TabsTrigger>
            <TabsTrigger value="reasoning" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Reasoning
            </TabsTrigger>
          </TabsList>

          {/* Tab Content with overflow */}
          <div className="overflow-y-auto mt-3 h-0 flex-1">

          {/* Policy Tab */}
          <TabsContent value="policy" className="mt-3 h-full">
            {policyText ? (
              <PolicyViewer policyText={policyText} />
            ) : (
              <div className="text-center text-muted-foreground py-6">
                No policy information available
              </div>
            )}
          </TabsContent>

          {/* Input Tab */}
          <TabsContent value="input" className="mt-3 h-full">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-2">Test Content (User Input)</h3>
                <div className="bg-muted p-4 rounded-md border-2 border-primary/20">
                  <p className="text-sm whitespace-pre-wrap font-mono">{userMessage}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expected Classification</p>
                  <Badge variant="outline" className="text-lg p-2">{test.test_result?.expected ?? "N/A"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Model Classified As</p>
                  <Badge
                    variant={test.test_result?.passed ? "default" : "destructive"}
                    className="text-lg p-2"
                  >
                    {test.test_result?.actual ?? "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Output Tab */}
          <TabsContent value="output" className="mt-3 h-full">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold mb-2">Model Classification</h3>
                <div className="bg-muted p-4 rounded-md text-center">
                  <Badge
                    variant={test.test_result?.passed ? "default" : "destructive"}
                    className="text-2xl p-3"
                  >
                    {test.response.content}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Expected:</p>
                  <Badge variant="outline" className="text-xl p-3">{test.test_result?.expected ?? "N/A"}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Result:</p>
                  <StatusBadge passed={test.test_result?.passed ?? false} showIcon={true} />
                  {!test.test_result?.passed && (
                    <p className="text-xs text-destructive mt-2">
                      ⚠️ Classification mismatch - review policy and reasoning
                    </p>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Model: {test.request.model}</p>
                <p>Finish Reason: {test.response.finish_reason}</p>
                <p>Response ID: {test.response.id}</p>
              </div>
            </div>
          </TabsContent>

          {/* Reasoning Tab */}
          <TabsContent value="reasoning" className="mt-3 h-full">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {test.reasoning && (
                  <>
                    <div>
                      <h3 className="text-base font-semibold mb-2">Model's Reasoning Process</h3>
                      <div className="bg-muted p-4 rounded-md border-l-4 border-primary">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{test.reasoning}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Policy Analysis */}
                    <div>
                      <h3 className="text-base font-semibold mb-2">Policy Reference Analysis</h3>
                      <PolicyHighlighter
                        reasoning={test.reasoning}
                        expectedClassification={test.test_result?.expected ?? ""}
                        reasoning_validation={test.reasoning_validation}
                      />
                    </div>
                  </>
                )}

                {test.reasoning_validation && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-base font-semibold mb-2">Reasoning Quality Metrics</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
                          <p className={`text-3xl font-bold ${getQualityScoreColor(test.reasoning_validation.quality_score)}`}>
                            {test.reasoning_validation.quality_score.toFixed(0)}/100
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Reasoning Length</p>
                          <p className="text-3xl font-bold">{test.reasoning_validation.reasoning_length}</p>
                          <p className="text-xs text-muted-foreground">words</p>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Mentions Policy</p>
                          <Badge variant={test.reasoning_validation.mentions_policy ? "default" : "destructive"}>
                            {test.reasoning_validation.mentions_policy ? "Yes ✓" : "No ✗"}
                          </Badge>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="text-sm text-muted-foreground mb-1">Mentions Severity</p>
                          <Badge variant={test.reasoning_validation.mentions_severity ? "default" : "secondary"}>
                            {test.reasoning_validation.mentions_severity ? "Yes ✓" : "No ✗"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: Metrics Sidebar (40% on desktop) */}
      <div className="lg:w-2/5 overflow-y-auto h-full">
        <div className="bg-card border rounded-lg p-3 h-full flex flex-col">
          {/* Performance Metrics Section */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance Metrics
            </h3>

            {/* Token Breakdown */}
            <div className="bg-muted/50 p-2 rounded-md mb-3">
              <TokenBreakdown test={test} variant="compact" />
            </div>

            {/* Cost & Latency */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>Cost</span>
                </div>
                <CostDisplay cost={test.metrics?.cost_usd || test.cost_usd || 0} showDetails={true} size="sm" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Latency</span>
                </div>
                <p className="font-mono text-lg font-bold">{formatLatency(test.metrics?.latency_ms || test.latency_ms || 0)}</p>
                {(test.metrics?.latency_ms || test.latency_ms || 0) > 3000 && (
                  <Badge variant="destructive" className="text-xs">Slow</Badge>
                )}
              </div>
            </div>

            {/* Cost Efficiency */}
            {(test.usage?.total_tokens || test.tokens?.total || 0) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-2 rounded text-xs mb-3">
                <p className="text-muted-foreground">
                  Cost per 1K tokens: <span className="font-mono font-semibold">
                    ${(((test.metrics?.cost_usd || test.cost_usd || 0) / (test.usage?.total_tokens || test.tokens?.total || 0)) * 1000).toFixed(4)}
                  </span>
                </p>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Token Details Section */}
          <div className="mb-3">
            <h3 className="text-sm font-semibold mb-2">Token Details</h3>
            <TokenBreakdown test={test} variant="detailed" />
          </div>

          <Separator className="my-3" />

          {/* Test Information Section */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">Test Information</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Test Number:</span>
                <span className="font-mono">{test.test_number ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-mono text-xs">{test.request.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response ID:</span>
                <span className="font-mono text-xs truncate max-w-[200px]" title={test.response.id}>
                  {test.response.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finish Reason:</span>
                <span className="font-mono text-xs">{test.response.finish_reason}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </DialogContent>
    </Dialog>
  );
}
