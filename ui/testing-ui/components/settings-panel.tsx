"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/settings-context";
import { Settings } from "lucide-react";

export function SettingsPanel() {
  const { strictPolicyValidation, setStrictPolicyValidation } = useSettings();

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
      <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="strict-policy"
            checked={strictPolicyValidation}
            onCheckedChange={setStrictPolicyValidation}
          />
          <Label htmlFor="strict-policy" className="text-sm cursor-pointer">
            Strict Policy Validation
          </Label>
        </div>
        <Badge variant={strictPolicyValidation ? "default" : "secondary"} className="text-xs">
          {strictPolicyValidation ? "Strict Mode" : "Lenient Mode"}
        </Badge>
      </div>
      {!strictPolicyValidation && (
        <span className="text-xs text-muted-foreground">
          (Missing policy citations ignored)
        </span>
      )}
    </div>
  );
}
