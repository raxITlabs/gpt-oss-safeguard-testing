import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/consent">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Consent
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect the following information when you request access to our AI Safety Testing Dashboard:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>First name and last name</li>
                  <li>Work email address</li>
                  <li>Timestamp of consent acceptance</li>
                  <li>IP address (for security and audit purposes)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  Your information is used for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Granting and managing access to the dashboard</li>
                  <li>Lead generation and analytics</li>
                  <li>Security monitoring and abuse prevention</li>
                  <li>Compliance with legal obligations</li>
                  <li>Improving our services and user experience</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">3. Data Storage & Security</h2>
                <p className="text-muted-foreground">
                  Your data is stored securely using industry-standard encryption methods:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Session data is encrypted using AES-256-GCM encryption</li>
                  <li>Cookies are HTTP-only and secure, preventing XSS attacks</li>
                  <li>Lead data is stored on secure servers with restricted access</li>
                  <li>All data transmission occurs over HTTPS</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">4. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your data as follows:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Session cookies expire after 30 days of inactivity</li>
                  <li>Lead data is retained indefinitely for business purposes</li>
                  <li>You may request deletion of your data at any time (see Section 5)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">5. Your Rights (GDPR Compliance)</h2>
                <p className="text-muted-foreground">
                  Under GDPR and applicable privacy laws, you have the following rights:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw your consent at any time</li>
                  <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  To exercise any of these rights, please contact us at the email address below.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  We do not share your personal data with third parties except:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>With your explicit consent</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do not sell or rent your personal information to third parties.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li><strong>Session Cookie:</strong> Stores your consent and access status (30-day expiration)</li>
                  <li><strong>Security:</strong> Cookies are HTTP-only, secure, and use SameSite=Lax for CSRF protection</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You can clear your cookies at any time through your browser settings. This will log you out
                  and require you to accept the consent form again.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for individuals under the age of 18. We do not knowingly
                  collect personal information from children. If we become aware that we have collected
                  personal information from a child, we will take steps to delete that information.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify users of any
                  material changes by updating the "Last updated" date at the top of this policy.
                  Continued use of the dashboard after changes constitutes acceptance of the updated policy.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  For privacy-related questions, to exercise your rights, or to report concerns, please contact us:
                </p>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p className="font-medium">raxIT Labs Privacy Team</p>
                  <p className="text-sm">
                    Email:{" "}
                    <a href="mailto:privacy@raxitlabs.com" className="text-primary hover:underline">
                      privacy@raxitlabs.com
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} raxIT Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
