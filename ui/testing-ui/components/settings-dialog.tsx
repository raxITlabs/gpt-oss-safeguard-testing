"use client";

import { Settings, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/settings-context";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { strictPolicyValidation, setStrictPolicyValidation } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Settings
          </DialogTitle>
          <DialogDescription>
            Configure your testing dashboard preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Strict Mode Setting */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="strict-policy-modal" className="text-base font-medium cursor-pointer">
                    Strict Mode
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="inline-flex items-center justify-center rounded-full hover:bg-muted p-1 transition-colors"
                          aria-label="Learn about Strict Mode"
                          type="button"
                        >
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Strict Mode</p>
                          <p className="text-xs text-muted-foreground">
                            Applies stricter validation rules for policy compliance. Tests that pass with warnings in normal mode will fail in strict mode.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge
                    variant={strictPolicyValidation ? "default" : "secondary"}
                    className="text-xs px-2 h-6"
                  >
                    {strictPolicyValidation ? "ON" : "OFF"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Apply stricter validation rules for policy compliance
                </p>
              </div>
              <Switch
                id="strict-policy-modal"
                checked={strictPolicyValidation}
                onCheckedChange={setStrictPolicyValidation}
                aria-describedby="strict-mode-description-modal"
              />
            </div>
          </div>

          {/* Future settings can be added here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
