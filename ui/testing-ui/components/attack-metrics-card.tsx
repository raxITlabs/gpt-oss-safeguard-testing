"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, CheckCircle, XCircle } from "lucide-react";
import type { InferenceEvent } from "@/types/test-results";

interface AttackMetricsCardProps {
  inferences: InferenceEvent[];
}

export function AttackMetricsCard({ inferences }: AttackMetricsCardProps) {
  // Filter for attack turns only (multi-turn and prompt injection)
  const attackTurns = inferences.filter(inf =>
    inf.attack_turn === true &&
    (inf.test_type === 'multi-turn' || inf.test_type === 'prompt_injection')
  );

  if (attackTurns.length === 0) return null;

  // Calculate metrics (matching CLI terminology)
  const attacksAttempted = attackTurns.length;
  const attacksSucceeded = attackTurns.filter(inf => inf.attack_succeeded === true).length;
  const attacksBlocked = attacksAttempted - attacksSucceeded;
  const attackSuccessRate = ((attacksSucceeded / attacksAttempted) * 100).toFixed(1);
  const defenseRate = (100 - parseFloat(attackSuccessRate)).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Attack Defense Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Attacks Attempted */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Attacks Attempted</div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{attacksAttempted}</span>
            </div>
          </div>

          {/* Attacks Blocked (Good) */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Attacks Blocked</div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[color:var(--status-success)]" />
              <span className="text-2xl font-bold text-[color:var(--status-success)]">
                {attacksBlocked}
              </span>
            </div>
          </div>

          {/* Attacks Succeeded (Bad) */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Attacks Succeeded</div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-[color:var(--status-error)]" />
              <span className="text-2xl font-bold text-[color:var(--status-error)]">
                {attacksSucceeded}
              </span>
            </div>
          </div>

          {/* Defense Rate */}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Defense Rate</div>
            <div className="text-2xl font-bold">
              {defenseRate}%
            </div>
            <Badge
              variant={parseFloat(defenseRate) >= 90 ? "default" :
                      parseFloat(defenseRate) >= 70 ? "secondary" : "destructive"}
              className="text-xs"
            >
              ASR: {attackSuccessRate}%
            </Badge>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-4 p-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
          <strong>Attack Success Rate (ASR):</strong> Percentage of attacks that bypassed the safeguard.
          Lower is better (target: 0%). Defense Rate = 100% - ASR.
        </div>
      </CardContent>
    </Card>
  );
}
