"use client";

/**
 * Failure Pattern Groups Display
 * Shows grouped failures by reason type with expandable test lists
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { FailurePatternGroup } from "@/types/analytics";

export interface FailureGroupsProps {
  groups: FailurePatternGroup[];
  onTestClick?: (testNumber: number) => void;
  className?: string;
}

const priorityColors = {
  high: {
    border: "border-[color:var(--status-error)]",
    bg: "bg-[color:var(--status-error-bg)]",
    badge: "destructive",
  },
  medium: {
    border: "border-[color:var(--status-warning)]",
    bg: "bg-[color:var(--status-warning-bg)]",
    badge: "secondary",
  },
  low: {
    border: "border-[color:var(--status-info)]",
    bg: "bg-[color:var(--status-info-bg)]",
    badge: "outline",
  },
};

export function FailureGroups({ groups, onTestClick, className }: FailureGroupsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (reasonType: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(reasonType)) {
      newExpanded.delete(reasonType);
    } else {
      newExpanded.add(reasonType);
    }
    setExpandedGroups(newExpanded);
  };

  if (groups.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Failure Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-[color:var(--status-success)]" />
            <p className="font-medium">No failures detected!</p>
            <p className="text-sm mt-2">All tests passed successfully.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Pattern Groups</CardTitle>
          <CardDescription>
            {groups.length} distinct failure patterns identified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge
                key={group.reasonType}
                variant={priorityColors[group.priority].badge as any}
                className="gap-1"
              >
                {group.displayName}: {group.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Failure Groups */}
      {groups.map((group) => {
        const colors = priorityColors[group.priority];
        const isExpanded = expandedGroups.has(group.reasonType);

        return (
          <Card key={group.reasonType} className={`border-l-4 ${colors.border} ${colors.bg}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{group.displayName}</CardTitle>
                    <Badge variant={colors.badge as any}>{group.priority.toUpperCase()}</Badge>
                    <Badge variant="outline">{group.count} tests</Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{group.percentage.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">of failures</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Avg Cost</div>
                  <div className="font-semibold">${group.avgCost.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Avg Latency</div>
                  <div className="font-semibold">{Math.round(group.avgLatency)}ms</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Recommendations</div>
                  <div className="font-semibold">{group.recommendations.length} available</div>
                </div>
              </div>

              {/* Missing Policy Codes */}
              {group.missingPolicyCodes && group.missingPolicyCodes.length > 0 && (
                <div className="rounded-lg border border-[color:var(--status-error)] bg-[color:var(--status-error-bg)] p-3">
                  <div className="text-sm font-medium text-[color:var(--status-error)] mb-2">
                    Missing Policy Codes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.missingPolicyCodes.map((code) => (
                      <Badge key={code} variant="destructive" className="font-mono text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Test List */}
              <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.reasonType)}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Tests
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Show {group.count} Affected Tests
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-2">
                  {group.tests.map((test) => (
                    <div
                      key={test.response.id || `${test.category}-${test.test_number}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer"
                      onClick={() => onTestClick?.(test.test_number!)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{test.test_name}</span>
                          <Badge variant="outline">#{test.test_number}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expected: {test.test_result?.expected || test.expected} →
                          Actual: {test.test_result?.actual || test.model_output}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
