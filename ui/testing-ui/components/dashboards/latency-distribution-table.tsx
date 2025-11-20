"use client";

/**
 * Latency Distribution Table
 * Displays detailed latency statistics in a tabular format
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

interface LatencyStats {
  p99: number;
  min: number;
  max: number;
  mean: number;
}

interface LatencyDistributionTableProps {
  latency: LatencyStats;
  slaThreshold: number;
  className?: string;
}

export function LatencyDistributionTable({
  latency,
  slaThreshold,
  className,
}: LatencyDistributionTableProps) {
  const getStatusVariant = (value: number, threshold: number): "default" | "outline" | "secondary" | "destructive" => {
    if (value <= threshold * 0.7) return "default";
    if (value <= threshold) return "outline";
    if (value <= threshold * 1.5) return "secondary";
    return "destructive";
  };

  const getStatusLabel = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return "Excellent";
    if (value <= threshold) return "Good";
    if (value <= threshold * 1.5) return "Acceptable";
    return "Critical";
  };

  const rows = [
    {
      metric: "P99 Latency",
      value: `${Math.round(latency.p99)}ms`,
      description: "99th percentile - worst case for most users",
      status: getStatusLabel(latency.p99, slaThreshold),
      variant: getStatusVariant(latency.p99, slaThreshold * 1.5),
    },
    {
      metric: "Minimum Latency",
      value: `${Math.round(latency.min)}ms`,
      description: "Best case response time",
      status: "Excellent",
      variant: "default" as const,
    },
    {
      metric: "Maximum Latency",
      value: `${Math.round(latency.max)}ms`,
      description: "Worst case response time",
      status: latency.max > slaThreshold * 2 ? "Critical" : "Warning",
      variant: latency.max > slaThreshold * 2 ? "destructive" as const : "secondary" as const,
    },
    {
      metric: "Latency Range",
      value: `${Math.round(latency.max - latency.min)}ms`,
      description: `Spread from ${Math.round(latency.min)}ms to ${Math.round(latency.max)}ms`,
      status: "Info",
      variant: "default" as const,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Latency Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell className="font-mono">{row.value}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.description}
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
