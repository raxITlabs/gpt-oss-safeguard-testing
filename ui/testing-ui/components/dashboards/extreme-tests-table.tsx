"use client";

/**
 * Extreme Tests Table
 * Displays fastest and slowest test details in a tabular format
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
import type { TestOutlier } from "@/types/analytics";

interface ExtremeTestsTableProps {
  fastestTest: TestOutlier;
  slowestTest: TestOutlier;
  className?: string;
}

export function ExtremeTestsTable({
  fastestTest,
  slowestTest,
  className,
}: ExtremeTestsTableProps) {
  const tests = [
    {
      type: "Fastest",
      test: fastestTest,
      variant: "default" as const,
    },
    {
      type: "Slowest",
      test: slowestTest,
      variant: "destructive" as const,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Extreme Test Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Test #</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((item) => (
              <TableRow key={item.type}>
                <TableCell>
                  <Badge variant={item.variant}>{item.type}</Badge>
                </TableCell>
                <TableCell className="font-mono">#{item.test.testNumber}</TableCell>
                <TableCell className="font-mono">
                  {Math.round(item.test.latency)}ms
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {item.test.testName || "Unknown test"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.test.category}
                </TableCell>
                <TableCell className="font-mono">{item.test.tokens}</TableCell>
                <TableCell className="text-right font-mono">
                  ${item.test.cost.toFixed(6)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
