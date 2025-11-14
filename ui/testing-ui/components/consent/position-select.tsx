"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase } from "lucide-react";

interface PositionSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const JOB_TITLES = [
  { value: "ceo", label: "CEO / Founder" },
  { value: "cto", label: "CTO / VP Engineering" },
  { value: "engineering-manager", label: "Engineering Manager" },
  { value: "senior-engineer", label: "Senior Engineer" },
  { value: "software-engineer", label: "Software Engineer" },
  { value: "security-lead", label: "Security Lead / CISO" },
  { value: "researcher", label: "AI Researcher" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "product-manager", label: "Product Manager" },
  { value: "other", label: "Other" },
];

export function PositionSelect({ value, onChange, disabled }: PositionSelectProps) {
  return (
    <div className="relative">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="position" className="pl-9 w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <SelectValue placeholder="Select your role" />
        </SelectTrigger>
        <SelectContent>
          {JOB_TITLES.map((title) => (
            <SelectItem key={title.value} value={title.value}>
              {title.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
