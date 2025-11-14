"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SafetyWarning() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2 border-status-error bg-status-error-bg" role="alert" aria-live="polite">
        <CollapsibleTrigger className="w-full text-left">
          <CardContent className="flex items-start gap-3 p-4 cursor-pointer hover:bg-status-error-bg/50 transition-colors">
            <AlertTriangle className="h-6 w-6 text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground" id="safety-warning-title">
                18+ Age Restricted Content - AI Safety Testing
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isOpen ? "Tap to collapse" : "Tap to read important safety information"}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-status-error transition-transform duration-200 flex-shrink-0 mt-0.5 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="flex gap-3">
              <div className="w-6 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm leading-relaxed text-foreground/90 space-y-2">
                <p>
                  This dashboard contains <strong>real, unfiltered test data from comprehensive AI safety evaluations</strong>, including adversarial prompts, jailbreak attempts, and security vulnerability assessments.
                </p>
                <p>
                  <strong className="text-status-error">Content Warning:</strong> To thoroughly test AI systems for safety vulnerabilities, this dashboard includes examples of:
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Sexual content and explicit material</strong></li>
                  <li><strong>Violent, harmful, and disturbing content</strong></li>
                  <li><strong>Hate speech and discriminatory language</strong></li>
                  <li><strong>Profanity and inappropriate language</strong></li>
                  <li><strong>Other mature themes unsuitable for minors</strong></li>
                </ul>
                <p>
                  This raw data represents the types of harmful inputs that AI systems must be tested against to ensure they respond safely and appropriately. <strong>The content is not suitable for children or those under 18 years of age.</strong>
                </p>
                <p>
                  <strong>Access is restricted to:</strong>
                </p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Authorized security professionals and researchers</li>
                  <li>Individuals 18 years or older</li>
                  <li>Personnel with legitimate AI safety research or testing needs</li>
                </ul>
                <p className="text-sm pt-1 text-foreground/80">
                  By proceeding, you acknowledge that you understand the explicit and sensitive nature of this content and will use it responsibly for legitimate security research, testing, or educational purposes only.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
