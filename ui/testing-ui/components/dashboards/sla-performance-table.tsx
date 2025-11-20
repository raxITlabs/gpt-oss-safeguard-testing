"use client";

/**
 * SLA Performance Table
 * Displays SLA compliance metrics in a tabular format
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SLACompliance } from "@/types/analytics";

interface SLAPerformanceTableProps {
  sla: SLACompliance;
  className?: string;
}

export function SLAPerformanceTable({
  sla,
  className,
}: SLAPerformanceTableProps) {
  const totalTests = sla.testsWithinSLA + sla.testsViolatingSLA;
  const compliancePercentage = ((sla.testsWithinSLA / totalTests) * 100).toFixed(1);
  const violationPercentage = ((sla.testsViolatingSLA / totalTests) * 100).toFixed(1);

  const rows = [
    {
      metric: "Tests Within SLA",
      value: sla.testsWithinSLA,
      details: `${compliancePercentage}% of total tests`,
      status: "Passing",
      variant: "success" as const,
    },
    {
      metric: "SLA Violations",
      value: sla.testsViolatingSLA,
      details: `${violationPercentage}% of total tests`,
      status: sla.testsViolatingSLA === 0 ? "None" : "Failed",
      variant: sla.testsViolatingSLA === 0 ? "success" as const : "destructive" as const,
    },
    {
      metric: "Avg Violation Amount",
      value: sla.testsViolatingSLA > 0 ? `+${Math.round(sla.avgViolationAmount)}ms` : "N/A",
      details: sla.testsViolatingSLA > 0 ? "Over threshold per violation" : "No violations",
      status: sla.avgViolationAmount > 500 ? "High" : sla.testsViolatingSLA > 0 ? "Moderate" : "None",
      variant: sla.avgViolationAmount > 500 ? "destructive" as const : sla.testsViolatingSLA > 0 ? "warning" as const : "success" as const,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">
          SLA Performance
          <span className="text-sm text-muted-foreground ml-2 font-normal">
            (Target: {sla.threshold}ms)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell className="font-mono">{row.value}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.details}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.variant}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
