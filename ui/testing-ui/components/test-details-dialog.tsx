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
import { FileText, MessageSquare, Bot, Brain, BarChart3 } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { StatusBadge } from "./status-badge";
import { PolicyViewer } from "./policy-viewer";
import { PolicyHighlighter } from "./policy-highlighter";
import { extractPolicy } from "@/lib/policy-utils";
import { formatCurrency, formatLatency } from "@/lib/format-utils";
import { analyzeFailure } from "@/lib/failure-analyzer";

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
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Test #{test.test_number}: {test.test_name}</span>
            <StatusBadge passed={isPassed} />
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>{new Date(test.timestamp).toLocaleString()}</span>
            <span className="flex items-center gap-4 text-sm">
              <span>Expected: <Badge variant="outline">{test.test_result?.expected ?? "N/A"}</Badge></span>
              <span>Actual: <Badge variant="outline">{test.test_result?.actual ?? "N/A"}</Badge></span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="policy" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="metrics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Policy Tab */}
          <TabsContent value="policy" className="mt-4">
            {policyText ? (
              <PolicyViewer policyText={policyText} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No policy information available
              </div>
            )}
          </TabsContent>

          {/* Input Tab */}
          <TabsContent value="input" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Content (User Input)</h3>
                <div className="bg-muted p-6 rounded-md border-2 border-primary/20">
                  <p className="text-sm whitespace-pre-wrap font-mono">{userMessage}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
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
          <TabsContent value="output" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Model Classification</h3>
                <div className="bg-muted p-6 rounded-md text-center">
                  <Badge
                    variant={test.test_result?.passed ? "default" : "destructive"}
                    className="text-3xl p-4"
                  >
                    {test.response.content}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
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
          <TabsContent value="reasoning" className="mt-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {test.reasoning && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Model's Reasoning Process</h3>
                      <div className="bg-muted p-6 rounded-md border-l-4 border-primary">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{test.reasoning}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Policy Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Policy Reference Analysis</h3>
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
                      <h3 className="text-lg font-semibold mb-3">Reasoning Quality Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
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

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-6 rounded-md text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Tokens</p>
                    <p className="text-4xl font-bold font-mono">{test.usage?.total_tokens || 0}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {test.usage?.prompt_tokens || 0} prompt + {test.usage?.completion_tokens || 0} completion
                    </p>
                  </div>
                  <div className="bg-muted p-6 rounded-md text-center">
                    <p className="text-sm text-muted-foreground mb-2">Cost</p>
                    <p className="text-4xl font-bold font-mono">{formatCurrency(test.metrics?.cost_usd || 0)}</p>
                  </div>
                  <div className="bg-muted p-6 rounded-md text-center">
                    <p className="text-sm text-muted-foreground mb-2">Latency</p>
                    <p className="text-4xl font-bold font-mono">{formatLatency(test.metrics?.latency_ms || 0)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Test Information</h3>
                <div className="bg-muted p-6 rounded-md space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Test Number:</span>
                    <span className="font-mono">{test.test_number}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Test Name:</span>
                    <span className="font-mono">{test.test_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono">{new Date(test.timestamp).toISOString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Model:</span>
                    <span className="font-mono text-xs">{test.request.model}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Response ID:</span>
                    <span className="font-mono text-xs">{test.response.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
