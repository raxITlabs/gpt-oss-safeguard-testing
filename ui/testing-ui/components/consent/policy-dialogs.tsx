"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface PolicyDialogProps {
  type: "privacy" | "terms";
  children: React.ReactNode;
}

export function PolicyDialog({ type, children }: PolicyDialogProps) {
  const [open, setOpen] = useState(false);

  const content = {
    privacy: {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your information",
      body: (
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-2">1. Introduction</h3>
            <p className="text-muted-foreground">
              By using the Site or Services, you accept the practices and policies described in this Policy.
              If you do not agree, please do not access the platform.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Personal Information Collected</h3>
            <p className="text-muted-foreground">
              We collect the following information:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>General identifiers: names, emails, company details, organization, position</li>
              <li>Online identifiers: device info, IP addresses, browser data</li>
              <li>Commercial information: marketing preferences, inquiries</li>
              <li>Professional/employment details: job title, organization</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We also collect data automatically through cookies, session tracking, and analytics tools like PostHog.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. How We Use Your Information</h3>
            <p className="text-muted-foreground">
              Your data is used for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Service provision and personalization</li>
              <li>Research and development (including anonymization)</li>
              <li>Marketing communications (with opt-out options)</li>
              <li>Legal compliance and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Third-Party Service Providers</h3>
            <p className="text-muted-foreground">
              We share data with the following service providers:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>AWS (hosting and Bedrock AI)</li>
              <li>Vercel (deployment and CDN)</li>
              <li>PostHog (analytics)</li>
              <li>OpenRouter (backup AI functionality)</li>
            </ul>
            <p className="text-muted-foreground mt-2 font-medium">
              We do not sell your personal information.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Data Security</h3>
            <p className="text-muted-foreground">
              We use AWS Well-Architected principles to secure your data. Session data is encrypted using AES-256-GCM
              and stored in secure, HTTP-only cookies. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. International Data Transfers</h3>
            <p className="text-muted-foreground">
              Your data may be transferred to and processed in countries outside your residence.
              We acknowledge international data transfer requirements and comply accordingly.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. Your Rights (GDPR Compliance)</h3>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Request data portability (export your data)</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">8. Children's Privacy</h3>
            <p className="text-muted-foreground">
              Our services are not directed to individuals under 13 years of age. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">9. Do Not Track</h3>
            <p className="text-muted-foreground">
              We do not currently support Do Not Track signals.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">10. Contact Us</h3>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at:{" "}
              <a href="mailto:privacy@raxit.ai" className="text-primary hover:underline">
                privacy@raxit.ai
              </a>
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: January 2025
            </p>
          </section>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      description: "Conditions for accessing and using the dashboard",
      body: (
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-2">1. Company & Acceptance</h3>
            <p className="text-muted-foreground">
              These Terms of Service are between you and <strong>RAXIT LABS PTY LTD (ABN 32 688 231 843)</strong>.
              BY USING, DOWNLOADING, INSTALLING, OR OTHERWISE ACCESSING THE SERVICES, YOU HEREBY AGREE TO BE BOUND BY THESE TERMS.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Age Requirements</h3>
            <p className="text-muted-foreground">
              Users must be 13+ years old. If you are under the legal age of majority, you must have parental consent.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. User Content License</h3>
            <p className="text-muted-foreground">
              You retain responsibility for all uploaded material. By uploading content, you grant raxIT AI
              a worldwide, royalty-free, and non-exclusive license to reproduce, adapt, and modify such User Content
              for the purpose of providing the Services.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Authorized Use</h3>
            <p className="text-muted-foreground">
              Access to this dashboard is granted solely for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>AI safety research and analysis</li>
              <li>Security testing evaluation</li>
              <li>Educational and professional development purposes</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Prohibited Activities</h3>
            <p className="text-muted-foreground">
              You agree NOT to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Reverse engineer or attempt security circumvention</li>
              <li>Scrape data or gather competitive intelligence</li>
              <li>Distribute illegal or harmful content</li>
              <li>Share access credentials or harmful content examples publicly</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. Account Termination</h3>
            <p className="text-muted-foreground">
              We reserve the right to revoke access at any time for violation of these terms,
              misuse of data or content, or suspicious/unauthorized activity.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. No Warranties</h3>
            <p className="text-muted-foreground">
              Services provided "AS IS" with explicit warranty disclaimers. We do not guarantee
              the accuracy, completeness, or reliability of test results.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">8. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              Our liability is capped at the greater of: (a) the amount you actually paid us in the past twelve months, or
              (b) one hundred dollars (AUD $100.00).
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">9. Intellectual Property</h3>
            <p className="text-muted-foreground">
              All content, features, and functionality are owned by raxIT AI and protected by international
              copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">10. Governing Law & Disputes</h3>
            <p className="text-muted-foreground">
              These terms are governed by the laws of New South Wales, Australia. Disputes shall be subject to
              the exclusive jurisdiction of courts in New South Wales. Claims must be filed within one year
              of the applicable claim date.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">11. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: January 2025
            </p>
          </section>
        </div>
      ),
    },
  };

  const { title, description, body } = content[type];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-primary hover:underline font-medium"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {body}
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
