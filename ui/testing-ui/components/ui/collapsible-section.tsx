"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CollapsibleSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  headerClassName?: string
}

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  className,
  headerClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className={cn(
          "flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors",
          headerClassName
        )}>
          <div className="flex-1 text-left">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground shrink-0 transition-transform duration-200 ml-2",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t border-border/50">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
