"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { LogFileInfo, TestCategory } from "@/types/test-results";
import { FileText, Layers } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";

interface LogSelectorProps {
  logFiles: LogFileInfo[];
  selectedFile: string | null;
  onFileChange: (filename: string) => void;
  mergedMode?: string;
}

export function LogSelector({ logFiles, selectedFile, onFileChange, mergedMode }: LogSelectorProps) {
  if (logFiles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No log files found
      </div>
    );
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getCategoryBadgeStyle = (category?: string): React.CSSProperties | undefined => {
    if (!category) return undefined;

    const color = CATEGORY_COLORS[`${category}-baseline`] || CATEGORY_COLORS[category] || CATEGORY_COLORS['unknown'];

    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`,
    };
  };

  return (
    <div className="flex items-center gap-3">
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={selectedFile || undefined} onValueChange={onFileChange}>
        <SelectTrigger className="w-full sm:w-[400px]">
          <SelectValue placeholder="Select a test run..." />
        </SelectTrigger>
        <SelectContent>
          {mergedMode && (
            <>
              <SelectItem value={mergedMode} className="font-semibold">
                <div className="flex items-center gap-2 py-0.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>All Categories (Latest Merged)</span>
                  <Badge variant="outline" className="text-xs leading-none px-1.5 py-0.5 ml-1">
                    Auto-Updated
                  </Badge>
                </div>
              </SelectItem>
              <SelectSeparator />
            </>
          )}
          {logFiles.map((file) => (
            <SelectItem key={file.filename} value={file.filename}>
              <div className="flex items-center gap-2 py-0.5">
                <span className="font-mono text-xs leading-none">{formatTimestamp(file.timestamp)}</span>
                {file.category && (
                  <Badge
                    variant="outline"
                    className="text-xs leading-none px-1.5 py-0.5"
                    style={getCategoryBadgeStyle(file.category)}
                  >
                    {file.category}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
