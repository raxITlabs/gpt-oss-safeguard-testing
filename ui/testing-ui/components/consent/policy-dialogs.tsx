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
            <h3 className="font-semibold mb-2">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect the following information when you request access to our AI Safety Testing Dashboard:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>First name and last name</li>
              <li>Work email address</li>
              <li>Timestamp of consent acceptance</li>
              <li>IP address (for security and audit purposes)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
            <p className="text-muted-foreground">
              Your information is used for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Granting and managing access to the dashboard</li>
              <li>Lead generation and analytics</li>
              <li>Security monitoring and abuse prevention</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. Data Storage & Security</h3>
            <p className="text-muted-foreground">
              Your data is stored securely using industry-standard encryption. Session data is
              encrypted using AES-256-GCM and stored in secure, HTTP-only cookies. Lead data
              is stored on secure servers with restricted access.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Data Retention</h3>
            <p className="text-muted-foreground">
              Session cookies expire after 30 days. Lead data is retained indefinitely for
              business purposes but can be deleted upon request.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Your Rights (GDPR Compliance)</h3>
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
            <h3 className="font-semibold mb-2">6. Third-Party Services</h3>
            <p className="text-muted-foreground">
              We do not share your data with third parties except as required by law.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. Contact Us</h3>
            <p className="text-muted-foreground">
              For privacy-related questions or to exercise your rights, contact us at:{" "}
              <a href="mailto:privacy@raxitlabs.com" className="text-primary hover:underline">
                privacy@raxitlabs.com
              </a>
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
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
            <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing this AI Safety Testing Dashboard, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Authorized Use Only</h3>
            <p className="text-muted-foreground">
              Access to this dashboard is granted solely for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>AI safety research and analysis</li>
              <li>Security testing evaluation</li>
              <li>Educational and professional development purposes</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              You agree <strong>NOT</strong> to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Redistribute or share access credentials</li>
              <li>Use testing examples for malicious purposes</li>
              <li>Attempt to reverse-engineer or exploit the system</li>
              <li>Share harmful content examples publicly without proper context</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. Content Warning Acknowledgment</h3>
            <p className="text-muted-foreground">
              You acknowledge that this dashboard contains:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Potentially harmful or offensive content</li>
              <li>Examples of prompt injection attacks</li>
              <li>Sensitive testing scenarios</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              You accept full responsibility for your use of this information and any
              consequences arising from exposure to this content.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Account Termination</h3>
            <p className="text-muted-foreground">
              We reserve the right to revoke access at any time for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
              <li>Violation of these terms</li>
              <li>Misuse of data or content</li>
              <li>Suspicious or unauthorized activity</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. No Warranties</h3>
            <p className="text-muted-foreground">
              The dashboard and its content are provided "as is" without warranties of any kind.
              We do not guarantee the accuracy, completeness, or reliability of test results.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. Limitation of Liability</h3>
            <p className="text-muted-foreground">
              We are not liable for any damages arising from your use of the dashboard,
              including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the
              dashboard after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">8. Governing Law</h3>
            <p className="text-muted-foreground">
              These terms are governed by and construed in accordance with applicable laws.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
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
