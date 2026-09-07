import { PublicLayout } from '@/components/layout/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Adxura ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p className="mb-2">Adxura is an AI-powered ad intelligence and generation platform. The Service provides:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI-inferred competitive analysis based on user-provided inputs</li>
              <li>AI-generated ad copy, scripts, hooks, and CTAs</li>
              <li>Project management for organizing research and outputs</li>
              <li>Data export capabilities</li>
            </ul>
            <p className="mt-2"><strong className="text-foreground">Important:</strong> All competitive analysis is AI-inferred and clearly labeled as such. Adxura does not scrape, access, or present real competitor advertisements as verified external data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be at least 18 years old to use the Service</li>
              <li>One person or entity per account. Sharing accounts is not permitted</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Subscription Plans & Billing</h2>
            <p className="mb-2">Adxura offers Free, Pro, and Agency subscription plans with different usage limits. By subscribing to a paid plan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You authorize Stripe to charge your payment method on a recurring basis</li>
              <li>Subscriptions renew automatically at the end of each billing period</li>
              <li>You can cancel at any time; access continues until the end of the current billing period</li>
              <li>Refunds are handled on a case-by-case basis</li>
              <li>Usage limits are enforced per calendar month and reset automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service to generate misleading, deceptive, or fraudulent advertising</li>
              <li>Violate any applicable advertising regulations or platform policies</li>
              <li>Attempt to circumvent usage limits or rate limiting</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code</li>
              <li>Use automated tools to scrape or extract data from the Service</li>
              <li>Share or resell access to your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p className="mb-2"><strong className="text-foreground">Your Content:</strong> You retain ownership of the data you input into the Service. You grant Adxura a limited license to process your data for the purpose of providing the Service.</p>
            <p><strong className="text-foreground">Generated Content:</strong> AI-generated outputs (analyses, ad copy, scripts) are provided for your use. You may use generated content in your advertising campaigns. Adxura does not claim ownership of generated outputs.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Disclaimers</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>AI-generated content may contain inaccuracies. You are responsible for reviewing all outputs before use</li>
              <li>Competitive analyses are inferred, not verified. Do not treat them as market research facts</li>
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee that generated ads will perform or convert</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Adxura shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of revenue, data, or business opportunities.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Termination</h2>
            <p>We may suspend or terminate your account if you violate these Terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@adxura.com" className="text-primary hover:underline">legal@adxura.com</a></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
