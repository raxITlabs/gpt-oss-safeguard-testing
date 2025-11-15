import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DateDisplay } from "@/components/date-display";

export default function TermsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <nav className="flex items-center gap-4" aria-label="Page navigation">
          <Link href="/consent">
            <Button variant="ghost" size="sm" aria-label="Return to consent form">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Consent
            </Button>
          </Link>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>
              Last updated: <DateDisplay format="full" />
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using this AI Safety Testing Dashboard (&quot;the Service&quot;), you agree
                  to be bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws and
                  regulations. If you do not agree with any of these terms, you are prohibited from
                  using or accessing this Service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">2. Authorized Use Only</h2>
                <p className="text-muted-foreground">
                  Access to this dashboard is granted solely for the following purposes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>AI safety research and analysis</li>
                  <li>Security testing evaluation and review</li>
                  <li>Educational and professional development purposes</li>
                  <li>Internal organizational use for improving AI safety</li>
                </ul>

                <p className="text-muted-foreground mt-4 font-medium">You explicitly agree NOT to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Redistribute, share, or publish access credentials to unauthorized parties</li>
                  <li>Use testing examples, prompts, or techniques for malicious purposes</li>
                  <li>Attempt to reverse-engineer, exploit, or compromise the system</li>
                  <li>Share harmful content examples publicly without proper safety context</li>
                  <li>Use the data to train AI models without explicit permission</li>
                  <li>Circumvent any access controls or security measures</li>
                  <li>Scrape, crawl, or automatically extract data from the dashboard</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">3. Content Warning Acknowledgment</h2>
                <p className="text-muted-foreground">
                  You explicitly acknowledge and understand that this dashboard contains:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Potentially harmful, offensive, or disturbing content</li>
                  <li>Examples of prompt injection and jailbreak attacks</li>
                  <li>Sensitive testing scenarios including violence, hate speech, and illegal activities</li>
                  <li>Content designed to test AI safety boundaries</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  You accept <strong>full responsibility</strong> for your use of this information and
                  any consequences arising from exposure to this content. We are not liable for any
                  psychological, emotional, or other harm resulting from viewing this content.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">4. Account Termination and Access Revocation</h2>
                <p className="text-muted-foreground">
                  We reserve the right to immediately revoke access at any time, with or without notice, for:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Violation of these Terms of Service</li>
                  <li>Misuse of data, content, or dashboard functionality</li>
                  <li>Suspicious, unauthorized, or malicious activity</li>
                  <li>Providing false or misleading information during registration</li>
                  <li>Sharing access credentials with unauthorized individuals</li>
                  <li>Any activity that may harm our systems, users, or reputation</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  No refunds or compensation will be provided for terminated access.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  The Service and its original content, features, and functionality are owned by
                  raxIT Labs and are protected by international copyright, trademark, patent, trade
                  secret, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground mt-2">
                  Test results, data, and analytics displayed in the dashboard remain the property
                  of raxIT Labs unless otherwise specified.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">6. No Warranties</h2>
                <p className="text-muted-foreground">
                  The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties
                  of any kind, either express or implied, including but not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Warranties of merchantability or fitness for a particular purpose</li>
                  <li>Warranties of non-infringement</li>
                  <li>Warranties regarding accuracy, completeness, or reliability of test results</li>
                  <li>Warranties of uninterrupted or error-free service</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We do not guarantee that the Service will meet your requirements or that defects
                  will be corrected.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by applicable law, raxIT Labs shall not be liable
                  for any indirect, incidental, special, consequential, or punitive damages, including
                  but not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                  <li>Damages resulting from unauthorized access to or use of our servers</li>
                  <li>Damages resulting from exposure to harmful content</li>
                  <li>Damages resulting from errors, mistakes, or inaccuracies in the Service</li>
                  <li>Personal injury or property damage resulting from your use of the Service</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Our total liability shall not exceed the amount paid by you, if any, for accessing
                  the Service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">8. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to defend, indemnify, and hold harmless raxIT Labs and its affiliates
                  from and against any claims, damages, obligations, losses, liabilities, costs, or
                  expenses arising from:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground ml-4">
                  <li>Your use or misuse of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time at our sole
                  discretion. We will provide notice of material changes by updating the &quot;Last updated&quot;
                  date at the top of this page.
                </p>
                <p className="text-muted-foreground mt-2">
                  Your continued use of the Service after any changes constitutes acceptance of the
                  new Terms. If you do not agree to the new Terms, you must stop using the Service.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">10. Governing Law and Jurisdiction</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed by and construed in accordance with the laws of the
                  jurisdiction in which raxIT Labs operates, without regard to its conflict of law
                  provisions.
                </p>
                <p className="text-muted-foreground mt-2">
                  Any disputes arising from these Terms or your use of the Service shall be resolved
                  in the courts of that jurisdiction.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">11. Severability</h2>
                <p className="text-muted-foreground">
                  If any provision of these Terms is held to be invalid or unenforceable, the
                  remaining provisions shall continue in full force and effect.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p className="font-medium">raxIT Labs Legal Team</p>
                  <p className="text-sm">
                    Email:{" "}
                    <a href="mailto:legal@raxitlabs.com" className="text-primary hover:underline">
                      legal@raxitlabs.com
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © <DateDisplay format="year" /> raxIT Labs. All rights reserved.
        </p>
      </div>
    </main>
  );
}
