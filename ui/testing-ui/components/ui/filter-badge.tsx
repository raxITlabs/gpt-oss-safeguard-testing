"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface FilterBadgeProps {
  label: string
  value: string
  onRemove?: () => void
  onClick?: () => void
  className?: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function FilterBadge({
  label,
  value,
  onRemove,
  onClick,
  className,
  variant = "secondary",
}: FilterBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1.5 pr-1 text-xs font-medium",
        onClick && "cursor-pointer hover:bg-secondary/80",
        className
      )}
      onClick={onClick}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            "ml-0.5 rounded-full p-0.5",
            "hover:bg-foreground/10 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
          aria-label={`Remove ${label} filter`}
        >
          <X className="size-3" />
        </button>
      )}
    </Badge>
  )
}

interface FilterBadgeGroupProps {
  children: React.ReactNode
  className?: string
  onClearAll?: () => void
}

export function FilterBadgeGroup({
  children,
  className,
  onClearAll,
}: FilterBadgeGroupProps) {
  return (
    <div className={cn("flex items-center flex-wrap gap-2", className)}>
      {children}
      {onClearAll && React.Children.count(children) > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            "text-xs text-muted-foreground hover:text-foreground underline",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          )}
        >
          Clear all
        </button>
      )}
    </div>
  )
}
