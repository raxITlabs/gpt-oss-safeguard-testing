"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConsentFormData, consentSchema } from "@/lib/consent-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { PolicyDialog } from "./policy-dialogs";
import { PositionSelect } from "./position-select";
import { OrganizationInput } from "./organization-input";
import { Mail, Loader2, ShieldCheck, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ConsentFormProps {
  onSubmit: (data: ConsentFormData) => Promise<void>;
}

// Enhanced checkbox component with better touch targets and accessibility
interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: React.ReactNode;
  error?: { message?: string };
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  disabled,
  label,
  error
}: ConsentCheckboxProps) {
  return (
    <Field orientation="horizontal">
      <div className="flex items-start space-x-2 px-1.5 py-1 cursor-pointer">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className="mt-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-required="true"
          aria-invalid={!!error}
        />
        <label htmlFor={id} className="flex-1 cursor-pointer select-none">
          <FieldLabel className="cursor-pointer leading-snug text-sm">
            {label}
          </FieldLabel>
        </label>
      </div>
      {error?.message && (
        <FieldError errors={[{ message: error.message }]} />
      )}
    </Field>
  );
}

export function ConsentForm({ onSubmit }: ConsentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      organization: "",
      position: "",
      customPosition: "",
      firstName: "",
      lastName: "",
      email: "",
      acceptPrivacy: false,
      acceptTerms: false,
      acceptSafety: false,
      marketingOptIn: true,
    },
  });

  const handleSubmit = async (data: ConsentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {/* Contact Information Section (Combined Professional + Personal) */}
      <div className="space-y-4 p-3 rounded-lg bg-gradient-to-br from-muted/15 to-muted/5 border border-border/40">
        {/* <div className="flex items-center gap-2 mb-1.5">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold tracking-tight text-foreground">Contact Information</h3>
        </div> */}

        <FieldGroup>
          {/* Organization + Position Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="organization">Organization *</FieldLabel>
              <OrganizationInput
                {...form.register("organization")}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Enter your company or organization name
              </FieldDescription>
              <FieldError errors={form.formState.errors.organization ? [{ message: form.formState.errors.organization.message || "" }] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">Position *</FieldLabel>
              <PositionSelect
                value={form.watch("position")}
                onChange={(value) => form.setValue("position", value, { shouldValidate: true })}
                disabled={isSubmitting}
              />
              <FieldDescription>
                Select the option that best describes your role
              </FieldDescription>
              <FieldError errors={form.formState.errors.position ? [{ message: form.formState.errors.position.message || "" }] : undefined} />
            </Field>
          </div>

          {/* Custom Position (conditional - full width) */}
          {form.watch("position") === "other" && (
            <Field>
              <FieldLabel htmlFor="customPosition">Please specify your position *</FieldLabel>
              <Input
                id="customPosition"
                placeholder="e.g., AI Safety Consultant"
                {...form.register("customPosition")}
                disabled={isSubmitting}
              />
              <FieldError errors={form.formState.errors.customPosition ? [{ message: form.formState.errors.customPosition.message || "" }] : undefined} />
            </Field>
          )}

          {/* First Name + Last Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                {...form.register("firstName")}
                disabled={isSubmitting}
              />
              <FieldError errors={form.formState.errors.firstName ? [{ message: form.formState.errors.firstName.message || "" }] : undefined} />
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                {...form.register("lastName")}
                disabled={isSubmitting}
              />
              <FieldError errors={form.formState.errors.lastName ? [{ message: form.formState.errors.lastName.message || "" }] : undefined} />
            </Field>
          </div>

          {/* Work Email (full width) */}
          <Field>
            <FieldLabel htmlFor="email">Work Email *</FieldLabel>
            <InputGroup>
              <InputGroupAddon position="inline-start">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                autoComplete="email"
                {...form.register("email")}
                disabled={isSubmitting}
              />
            </InputGroup>
            <FieldDescription>
              Please use your work email address. Personal email domains (gmail, yahoo, etc.) are not allowed.
            </FieldDescription>
            <FieldError errors={form.formState.errors.email ? [{ message: form.formState.errors.email.message || "" }] : undefined} />
          </Field>
        </FieldGroup>
      </div>

      {/* Consent Checkboxes Section */}
      <div className="space-y-1 pt-3 border-t border-border/50">
        {/* <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-semibold">Required Acknowledgments</h3>
        </div> */}

        <FieldGroup className="gap-0">
          {/* Privacy Policy */}
          <ConsentCheckbox
            id="acceptPrivacy"
            checked={!!form.watch("acceptPrivacy")}
            onChange={(checked) => form.setValue("acceptPrivacy", checked as boolean, { shouldValidate: true })}
            disabled={isSubmitting}
            label={
              <>
                I accept the{" "}
                <PolicyDialog type="privacy">Privacy Policy</PolicyDialog> *
              </>
            }
            error={form.formState.errors.acceptPrivacy}
          />

          {/* Terms of Service */}
          <ConsentCheckbox
            id="acceptTerms"
            checked={!!form.watch("acceptTerms")}
            onChange={(checked) => form.setValue("acceptTerms", checked as boolean, { shouldValidate: true })}
            disabled={isSubmitting}
            label={
              <>
                I accept the{" "}
                <PolicyDialog type="terms">Terms of Service</PolicyDialog> *
              </>
            }
            error={form.formState.errors.acceptTerms}
          />

          {/* Safety Warning */}
          <ConsentCheckbox
            id="acceptSafety"
            checked={!!form.watch("acceptSafety")}
            onChange={(checked) => form.setValue("acceptSafety", checked as boolean, { shouldValidate: true })}
            disabled={isSubmitting}
            label={
              <>
                I acknowledge this contains AI safety testing content and will use it responsibly *
              </>
            }
            error={form.formState.errors.acceptSafety}
          />

          {/* Marketing Opt-in */}
          <ConsentCheckbox
            id="marketingOptIn"
            checked={!!form.watch("marketingOptIn")}
            onChange={(checked) => form.setValue("marketingOptIn", checked as boolean)}
            disabled={isSubmitting}
            label={
              <>
                I agree to receive updates and insights from raxIT AI{" "}
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </>
            }
          />
        </FieldGroup>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="polite" aria-atomic="true">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full shadow-lg hover:shadow-xl transition-shadow"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span>Access Dashboard</span>
          </span>
        )}
      </Button>

      {/* <p className="text-xs text-center text-muted-foreground">
        By submitting this form, you confirm that all information provided is accurate
        and that you understand the nature of the content you will be accessing.
      </p> */}
    </form>
  );
}
