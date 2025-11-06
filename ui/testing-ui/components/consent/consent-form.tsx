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
import { Mail, User, Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsentFormProps {
  onSubmit: (data: ConsentFormData) => Promise<void>;
}

export function ConsentForm({ onSubmit }: ConsentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      acceptPrivacy: false,
      acceptTerms: false,
      acceptSafety: false,
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Personal Information Section */}
      <FieldGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name with Input Group */}
          <Field>
            <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
            <InputGroup>
              <InputGroupAddon position="inline-start">
                <User className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
                disabled={isSubmitting}
              />
            </InputGroup>
            <FieldError issues={form.formState.errors.firstName ? [{ message: form.formState.errors.firstName.message || "" }] : undefined} />
          </Field>

          {/* Last Name with Input Group */}
          <Field>
            <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
            <InputGroup>
              <InputGroupAddon position="inline-start">
                <User className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
                disabled={isSubmitting}
              />
            </InputGroup>
            <FieldError issues={form.formState.errors.lastName ? [{ message: form.formState.errors.lastName.message || "" }] : undefined} />
          </Field>
        </div>

        {/* Email with Input Group */}
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
              {...form.register("email")}
              disabled={isSubmitting}
            />
          </InputGroup>
          <FieldDescription>
            Please use your work email address. Personal email domains (gmail, yahoo, etc.) are not allowed.
          </FieldDescription>
          <FieldError issues={form.formState.errors.email ? [{ message: form.formState.errors.email.message || "" }] : undefined} />
        </Field>
      </FieldGroup>

      {/* Consent Checkboxes Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Required Acknowledgments</h3>
        </div>

        <FieldGroup>
          {/* Privacy Policy */}
          <Field orientation="horizontal">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptPrivacy"
                checked={!!form.watch("acceptPrivacy")}
                onCheckedChange={(checked) => {
                  form.setValue("acceptPrivacy", checked as boolean);
                }}
                disabled={isSubmitting}
                className="mt-1"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="acceptPrivacy" className="cursor-pointer">
                  I have read and accept the{" "}
                  <PolicyDialog type="privacy">Privacy Policy</PolicyDialog> *
                </FieldLabel>
                <FieldError issues={form.formState.errors.acceptPrivacy ? [{ message: form.formState.errors.acceptPrivacy.message || "" }] : undefined} />
              </div>
            </div>
          </Field>

          {/* Terms of Service */}
          <Field orientation="horizontal">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptTerms"
                checked={!!form.watch("acceptTerms")}
                onCheckedChange={(checked) => {
                  form.setValue("acceptTerms", checked as boolean);
                }}
                disabled={isSubmitting}
                className="mt-1"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="acceptTerms" className="cursor-pointer">
                  I agree to the{" "}
                  <PolicyDialog type="terms">Terms of Service</PolicyDialog> *
                </FieldLabel>
                <FieldError issues={form.formState.errors.acceptTerms ? [{ message: form.formState.errors.acceptTerms.message || "" }] : undefined} />
              </div>
            </div>
          </Field>

          {/* Safety Warning */}
          <Field orientation="horizontal">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acceptSafety"
                checked={!!form.watch("acceptSafety")}
                onCheckedChange={(checked) => {
                  form.setValue("acceptSafety", checked as boolean);
                }}
                disabled={isSubmitting}
                className="mt-1"
              />
              <div className="flex-1">
                <FieldLabel htmlFor="acceptSafety" className="cursor-pointer leading-relaxed">
                  I acknowledge this dashboard contains potentially harmful content used for
                  AI safety testing purposes and will use it responsibly for research,
                  security analysis, or educational purposes only *
                </FieldLabel>
                <FieldError issues={form.formState.errors.acceptSafety ? [{ message: form.formState.errors.acceptSafety.message || "" }] : undefined} />
              </div>
            </div>
          </Field>
        </FieldGroup>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Access Dashboard"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By submitting this form, you confirm that all information provided is accurate
        and that you understand the nature of the content you will be accessing.
      </p>
    </form>
  );
}
