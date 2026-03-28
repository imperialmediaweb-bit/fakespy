import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="mb-2"><strong className="text-foreground">Account Information:</strong> When you register, we collect your name, email address, and a hashed version of your password. We never store your password in plain text.</p>
            <p className="mb-2"><strong className="text-foreground">Project Data:</strong> Brand names, niches, competitor names, target audiences, and product descriptions you enter into your projects.</p>
            <p className="mb-2"><strong className="text-foreground">Generated Content:</strong> AI analysis results and ad generation outputs created through the platform.</p>
            <p><strong className="text-foreground">Payment Information:</strong> Payment processing is handled entirely by Stripe. We do not store credit card numbers. We store your Stripe customer ID and subscription status.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve the Adxura platform</li>
              <li>To process your subscriptions and enforce plan limits</li>
              <li>To send transactional emails (account verification, password resets)</li>
              <li>To generate AI-powered analyses and ad content based on your inputs</li>
              <li>To monitor platform usage for security and abuse prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p className="mb-2">All data is stored in encrypted PostgreSQL databases. API keys you store are encrypted with AES-256-GCM. Authentication uses JWT tokens with bcrypt password hashing (12 rounds). All connections use TLS/SSL encryption.</p>
            <p>We implement rate limiting, input validation, and webhook signature verification to protect against unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">OpenAI:</strong> Your project data (brand names, niches, competitors) is sent to OpenAI's API for analysis and ad generation. OpenAI's data usage policies apply.</li>
              <li><strong className="text-foreground">Stripe:</strong> Handles payment processing. Subject to Stripe's privacy policy.</li>
              <li><strong className="text-foreground">Railway:</strong> Infrastructure hosting provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>Your account data and project content are retained for as long as your account is active. When you delete a project, all associated analyses, generations, and exports are permanently removed. Account deletion removes all user data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and download your data via the Export feature</li>
              <li>Update or correct your profile information in Settings</li>
              <li>Delete your projects and associated data</li>
              <li>Request complete account deletion by contacting us</li>
              <li>Cancel your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Cookies</h2>
            <p>Adxura uses localStorage for authentication tokens (JWT access and refresh tokens). We do not use tracking cookies or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at <span className="text-primary">privacy@adxura.com</span></p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
