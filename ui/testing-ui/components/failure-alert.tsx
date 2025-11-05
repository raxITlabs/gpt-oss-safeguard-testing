"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { analyzeFailure } from "@/lib/failure-analyzer";

interface FailureAlertProps {
  inferences: InferenceEvent[];
  strictPolicyValidation?: boolean;
  onViewDetails?: () => void;
}

export function FailureAlert({ inferences, strictPolicyValidation = true, onViewDetails }: FailureAlertProps) {
  const [isOpen, setIsOpen] = useState(false);

  const failures = inferences.filter((inf) => analyzeFailure(inf, strictPolicyValidation) !== null);

  if (failures.length === 0) {
    return null;
  }

  const failureRate = (failures.length / inferences.length) * 100;

  return (
    <Alert variant="destructive" className="border-destructive/50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>
          {failures.length} Test{failures.length > 1 ? "s" : ""} Failed
          <Badge variant="outline" className="ml-2 border-destructive/50">
            {failureRate.toFixed(1)}% failure rate
          </Badge>
        </span>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <span className="text-sm flex-1 leading-relaxed">
            Review failed tests to identify policy violations or model issues
          </span>
          <div className="sm:flex-shrink-0">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-destructive/30 hover:bg-destructive/10"
                >
                  {isOpen ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 mr-1 shrink-0" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 mr-1 shrink-0" />
                      Show Details
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {failures.slice(0, 10).map((failure, idx) => (
                    <div
                      key={idx}
                      className="rounded-md p-2.5 bg-background/50 border border-destructive/20 text-xs"
                    >
                      <div className="font-semibold text-foreground leading-tight">
                        {failure.test_name}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                        <span>
                          Expected: <code className="bg-muted px-1 rounded text-foreground">{failure.test_result?.expected}</code>
                        </span>
                        <span>
                          Got: <code className="bg-muted px-1 rounded text-foreground">{failure.test_result?.actual}</code>
                        </span>
                      </div>
                    </div>
                  ))}
                  {failures.length > 10 && (
                    <div className="text-xs text-center text-muted-foreground py-1">
                      And {failures.length - 10} more failures... View in Details tab
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
