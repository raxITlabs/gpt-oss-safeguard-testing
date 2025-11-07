"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConsentForm } from "@/components/consent/consent-form";
import { SafetyWarning } from "@/components/consent/safety-warning";
import { ConsentFormData } from "@/lib/consent-validation";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GrainGradient } from "@paper-design/shaders-react";

function ConsentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [step, setStep] = useState<"verification" | "form">("verification");
  const [showUnderageMessage, setShowUnderageMessage] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    // Set initial state
    checkDarkMode();

    // Watch for changes to dark mode
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Light mode: Muted, pastel blue/purple palette
  const lightColors = [
    "#8aa5e8", // Muted Byzantine blue
    "#a8c8db", // Muted Air superiority blue
    "#d9edfa", // Very light Columbia blue
    "#7a8ed8", // Muted Persian blue
  ];

  // Dark mode: Subtle, darker versions
  const darkColors = [
    "#4a5f9f", // Subdued Byzantine blue
    "#5a7a8f", // Subdued Air superiority blue
    "#7a9fba", // Subdued Columbia blue
    "#3a4a8f", // Subdued Persian blue
  ];

  const colors = isDark ? darkColors : lightColors;
  const colorBack = isDark ? "#0a0a0a" : "#ffffff";

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

  const handleAgeVerification = (isOver18: boolean) => {
    if (isOver18) {
      setStep("form");
      setShowUnderageMessage(false);
    } else {
      setShowUnderageMessage(true);
    }
  };

  return (
    <main id="main-content" className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Mobile Logo */}
      <div className="w-full md:hidden flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 opacity-40">
          <GrainGradient
            width="100%"
            height="100%"
            colors={colors}
            colorBack={colorBack}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            speed={1.0}
          />
        </div>
        <Image
          src="/raxIT_webapp_logo_light.svg"
          alt="raxIT AI Logo"
          width={410}
          height={140}
          className="object-contain max-w-full h-auto relative z-10"
          priority
        />
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Form Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-8 overflow-hidden">
          <div className="w-full max-w-2xl space-y-4">
            {/* Card Container */}
            <div className="space-y-4 rounded-lg bg-card p-4 md:p-6 shadow-2xl">
              {step === "verification" ? (
                <>
                  {/* Safety Warning */}
                  <SafetyWarning />

                  {/* Age Verification */}
                  <fieldset className="space-y-4 pt-4 border-t">
                    <legend className="space-y-2">
                      <h2 className="text-xl font-semibold text-foreground">Age Verification Required</h2>
                      <p className="text-sm text-muted-foreground">
                        Due to the sensitive nature of the content, you must be at least 18 years old to access this dashboard.
                      </p>
                    </legend>

                    {showUnderageMessage ? (
                      <div
                        className="p-4 rounded-lg bg-status-error-bg border-2 border-status-error"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                      >
                        <div className="flex gap-3">
                          <ShieldX className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">Access Restricted</h3>
                            <p className="text-sm text-foreground/90">
                              You must be 18 years or older to access this content. If you believe this is an error, please contact us at{" "}
                              <a href="mailto:hi@raxit.ai" className="text-primary hover:underline">
                                hi@raxit.ai
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">Are you 18 years of age or older?</p>
                        <div className="flex gap-3" role="group" aria-label="Age verification">
                          <Button
                            onClick={() => handleAgeVerification(true)}
                            className="flex-1"
                            size="lg"
                            aria-label="Yes, I confirm I am 18 years of age or older"
                          >
                            <ShieldCheck className="h-5 w-5 mr-2" aria-hidden="true" />
                            Yes, I'm 18+
                          </Button>
                          <Button
                            onClick={() => handleAgeVerification(false)}
                            variant="outline"
                            className="flex-1"
                            size="lg"
                            aria-label="No, I am under 18 years of age"
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    )}
                  </fieldset>
                </>
              ) : (
                <>
                  {/* Header */}
                  <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold">Access Request</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                      To access the AI Safety Testing Dashboard, please provide your information
                      and acknowledge the terms below. This helps us ensure responsible use of
                      sensitive testing data.
                    </p>
                  </div>

                  {/* Form */}
                  <ConsentForm onSubmit={handleSubmit} />
                </>
              )}
            </div>

            {/* Footer - Outside Card */}
            <div className="space-y-2 px-2">
              {/* <div className="text-center text-xs text-muted-foreground">
                <p>
                  By submitting this form, you confirm that all information provided is accurate
                  and that you understand the nature of the content you will be accessing.
                </p>
              </div> */}
              <div className="text-center text-xs text-muted-foreground">
                {/* <p>Your session will remain active for 30 days.</p> */}
                <p className="mt-1.5">
                  Questions? Contact us at{" "}
                  <a
                    href="mailto:hi@raxit.ai"
                    className="text-primary hover:underline"
                  >
                    hi@raxit.ai
                  </a>
                </p>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} raxIT Labs Pvt Ltd. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Logo Section */}
        <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden p-4">
          <div className="absolute inset-0 opacity-40">
            <GrainGradient
              width="100%"
              height="100%"
              colors={colors}
              colorBack={colorBack}
              softness={0.5}
              intensity={0.5}
              noise={0.25}
              shape="corners"
              speed={1.0}
            />
          </div>
          <Image
            src="/raxIT_webapp_logo_light.svg"
            alt="raxIT AI Logo"
            width={410}
            height={140}
            className="object-contain max-w-full h-auto relative z-10"
            priority
          />
        </div>
      </div>
    </main>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading consent form...</p>
        </div>
      </div>
    }>
      <ConsentPageContent />
    </Suspense>
  );
}
