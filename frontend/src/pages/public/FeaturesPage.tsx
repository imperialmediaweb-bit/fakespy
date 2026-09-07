import { PublicLayout } from '@/components/layout/PublicLayout';
import { Search, Sparkles, FolderOpen, Download, Shield, Zap, Star, Users } from 'lucide-react';

const features = [
  { icon: Search, title: 'Competitive Ad Intelligence', items: ['AI-inferred competitive analysis of your brand and market', 'Strengths, weaknesses, opportunities and messaging angles', 'Confidence level on every insight', 'Honestly labeled as AI analysis — never presented as scraped ads', 'Provider layer ready for Meta Ad Library and Google Ads Transparency integrations'] },
  { icon: Sparkles, title: 'AI Ad Generation', items: ['Facebook ad copy (headline, primary text, description, CTA)', 'Google Search ads (headlines, descriptions, sitelinks)', 'Video ad scripts with timestamped visuals and voice-over', 'Scroll-stopping hooks and calls to action', 'Full multi-platform campaign briefs', 'Copy any field with one click'] },
  { icon: Star, title: 'Ad Scoring & Variations', items: ['Score any ad on clarity, emotional impact, CTR potential and conversion strength', 'Concrete improvement suggestions', 'Five rewrite styles: short, emotional, direct response, premium, urgency', 'Every variation saved to the project history'] },
  { icon: Users, title: 'Audience Builder', items: ['Ideal customer avatar per project', 'Pain points, desires, objections and buying triggers', 'Demographics and interest lists ready for ad targeting', 'Multiple saved profiles per project'] },
  { icon: FolderOpen, title: 'Project & Client Management', items: ['Organize work by brand or client', 'Agency dashboard groups projects by client', 'Analyses, ads, scores and audiences stored per project', 'Full audit trail of important actions'] },
  { icon: Download, title: 'Export & Reports', items: ['One-click JSON export of a complete project (analyses, ads, scores, variations, audiences)', 'Export history per account', 'Usage tracked against plan limits'] },
  { icon: Shield, title: 'Security & Billing', items: ['JWT access + hashed refresh tokens', 'bcrypt password hashing', 'AES-256-GCM encryption for stored provider keys', 'Rate limiting on every API route', 'Stripe subscriptions with signed, idempotent webhooks'] },
  { icon: Zap, title: 'Built for Operators', items: ['Configure OpenAI, Anthropic or Gemini keys from the admin panel — no redeploy', 'Stripe, PayPal, Razorpay, Paddle and LemonSqueezy credential slots', 'SMTP, SendGrid or Mailgun for email', 'PostgreSQL + Prisma, Redis, Docker-ready'] },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Features</h1>
          <p className="mt-3 text-muted-foreground text-lg">Everything you need for ad intelligence and generation.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {features.map(f => (
            <section key={f.title} aria-labelledby={`feat-${f.title}`} className="rounded-xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center"><f.icon className="h-5 w-5 text-primary" aria-hidden="true" /></div>
                <h2 id={`feat-${f.title}`} className="text-lg font-semibold">{f.title}</h2>
              </div>
              <ul className="space-y-2">{f.items.map(item => <li key={item} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-1" aria-hidden="true">•</span>{item}</li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
