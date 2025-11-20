"use client";

/**
 * Performance Outliers Table
 * Displays tests that are significantly slower than average
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

interface PerformanceOutliersTableProps {
  outliers: TestOutlier[];
  onOutlierClick?: (outlier: TestOutlier) => void;
  className?: string;
}

export function PerformanceOutliersTable({
  outliers,
  onOutlierClick,
  className,
}: PerformanceOutliersTableProps) {
  if (outliers.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">
          Performance Outliers
          <span className="text-sm text-muted-foreground ml-2 font-normal">
            ({outliers.length} tests significantly slower than average)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test #</TableHead>
              <TableHead>Latency</TableHead>
              <TableHead>Deviation</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outliers.map((outlier, index) => (
              <TableRow
                key={`${outlier.testNumber}-${outlier.testName}-${index}`}
                className={onOutlierClick ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onOutlierClick?.(outlier)}
              >
                <TableCell className="font-mono">#{outlier.testNumber}</TableCell>
                <TableCell className="font-mono">
                  {Math.round(outlier.latency)}ms
                </TableCell>
                <TableCell className="font-mono text-orange-600">
                  +{Math.round(outlier.deviationFromMean)}ms
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {outlier.testName || "Unknown test"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {outlier.category}
                </TableCell>
                <TableCell className="font-mono">{outlier.tokens}</TableCell>
                <TableCell className="font-mono">${outlier.cost.toFixed(6)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={outlier.passed ? "secondary" : "destructive"}>
                    {outlier.passed ? "Passed" : "Failed"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
