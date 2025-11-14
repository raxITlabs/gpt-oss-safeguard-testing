"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FILTER_PRESETS, type FilterPreset } from "@/lib/filter-presets";
import { cn } from "@/lib/utils";
import {
  LayoutGridIcon,
  ShieldIcon,
  ZapIcon,
  AlertTriangleIcon,
  ScaleIcon,
  LockIcon,
  FileWarningIcon,
} from "lucide-react";

interface FilterPresetsProps {
  activePresetId?: string;
  onPresetSelect: (presetId: string) => void;
  className?: string;
}

// Icon mapping for presets
const PRESET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  all: LayoutGridIcon,
  "all-baseline": ShieldIcon,
  "all-attacks": ZapIcon,
  critical: AlertTriangleIcon,
  policy: ScaleIcon,
  security: LockIcon,
  "edge-cases": FileWarningIcon,
};

export function FilterPresets({
  activePresetId,
  onPresetSelect,
  className,
}: FilterPresetsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">
        Quick Filters:
      </span>
      {FILTER_PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        const Icon = PRESET_ICONS[preset.id];

        return (
          <Button
            key={preset.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetSelect(preset.id)}
            className={cn(
              "h-8 gap-1.5 transition-all",
              isActive && "shadow-sm",
              !isActive && "hover:border-primary/50"
            )}
            title={preset.description}
            aria-label={`${preset.label}: ${preset.description}`}
            aria-pressed={isActive}
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{preset.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Compact version showing only the most commonly used presets
 */
export function FilterPresetsCompact({
  activePresetId,
  onPresetSelect,
  className,
}: FilterPresetsProps) {
  // Show only the most important presets
  const compactPresets = FILTER_PRESETS.filter((p) =>
    ["all", "all-baseline", "all-attacks", "critical"].includes(p.id)
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {compactPresets.map((preset) => {
        const isActive = activePresetId === preset.id;
        const Icon = PRESET_ICONS[preset.id];

        return (
          <Badge
            key={preset.id}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "cursor-pointer gap-1 px-3 py-1.5 transition-all hover:scale-105",
              isActive && "shadow-sm",
              !isActive && "hover:border-primary/50 hover:bg-primary/5"
            )}
            onClick={() => onPresetSelect(preset.id)}
            title={preset.description}
            role="button"
            aria-label={`${preset.label}: ${preset.description}`}
            aria-pressed={isActive}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPresetSelect(preset.id);
              }
            }}
          >
            {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
            <span className="text-xs font-medium">{preset.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}

/**
 * Preset cards with descriptions (for a more detailed layout)
 */
export function FilterPresetCards({
  activePresetId,
  onPresetSelect,
  className,
}: FilterPresetsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {FILTER_PRESETS.map((preset) => {
        const isActive = activePresetId === preset.id;
        const Icon = PRESET_ICONS[preset.id];

        return (
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset.id)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50 hover:bg-accent/50"
            )}
            aria-label={`${preset.label}: ${preset.description}`}
            aria-pressed={isActive}
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <div
                  className={cn(
                    "rounded-md p-1.5",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <h3
                className={cn(
                  "font-semibold",
                  isActive ? "text-foreground" : "text-foreground"
                )}
              >
                {preset.label}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {preset.description}
            </p>
            {isActive && (
              <div className="absolute right-2 top-2" aria-hidden="true">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
