"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
  iconClassName?: string
}

export function InfoTooltip({
  content,
  side = "top",
  className,
  iconClassName,
}: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full",
            className
          )}
          aria-label="More information"
        >
          <Info className={cn("size-4", iconClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
