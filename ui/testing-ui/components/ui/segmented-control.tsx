"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      role="tablist"
      aria-label="Navigation options"
    >
      {options.map((option, index) => {
        const isActive = value === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.value}`}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-background text-foreground shadow-sm dark:bg-input/30 dark:text-foreground"
                : "text-muted-foreground hover:text-foreground",
              className
            )}
          >
            {option.icon && (
              <span className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

