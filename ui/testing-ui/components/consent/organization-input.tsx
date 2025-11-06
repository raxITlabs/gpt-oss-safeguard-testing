"use client";

import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Building2 } from "lucide-react";
import { forwardRef } from "react";

interface OrganizationInputProps extends React.ComponentProps<typeof InputGroupInput> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OrganizationInput = forwardRef<HTMLInputElement, OrganizationInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <InputGroup>
        <InputGroupAddon position="inline-start">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          id="organization"
          type="text"
          placeholder="e.g., Acme Inc., Tech Corp"
          autoComplete="organization"
          ref={ref}
          {...props}
        />
      </InputGroup>
    );
  }
);

OrganizationInput.displayName = "OrganizationInput";
