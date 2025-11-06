"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ConsentForm } from "@/components/consent/consent-form";
import { SafetyWarning } from "@/components/consent/safety-warning";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ConsentFormData } from "@/lib/consent-validation";
import { ShieldAlert } from "lucide-react";

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const handleSubmit = async (data: ConsentFormData) => {
    try {
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Session cookie is set - redirect to app
        console.log("✅ Consent accepted, redirecting to:", returnTo);
        router.push(returnTo);
        router.refresh(); // Ensure middleware re-runs with new cookie
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit consent");
      }
    } catch (error) {
      console.error("❌ Consent submission failed:", error);
      throw error; // Re-throw to be caught by ConsentForm
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <ShieldAlert className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">raxIT Labs</h1>
          <p className="text-lg text-muted-foreground">AI Safety Testing Dashboard</p>
        </div>

        {/* Safety Warning */}
        <SafetyWarning />

        {/* Consent Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Access Request</CardTitle>
            <CardDescription>
              To access the AI Safety Testing Dashboard, please provide your information
              and acknowledge the terms below. This helps us ensure responsible use of
              sensitive testing data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsentForm onSubmit={handleSubmit} />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t pt-6">
            <div className="w-full space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                Your session will remain active for 30 days.
              </p>
              <p className="text-xs text-muted-foreground">
                Questions? Contact us at{" "}
                <a
                  href="mailto:support@raxitlabs.com"
                  className="text-primary hover:underline"
                >
                  support@raxitlabs.com
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} raxIT Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
