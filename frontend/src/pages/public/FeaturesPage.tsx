import { PublicLayout } from '@/components/layout/PublicLayout';
import { Search, Sparkles, FolderOpen, Download, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Search, title: 'Competitive Ad Intelligence', items: ['AI-inferred competitive analysis', 'Strengths, weaknesses, and opportunities', 'Messaging angles and strategic insights', 'Clearly labeled as AI analysis, not scraped data', 'Future-ready for Meta Ad Library and Google Ads integrations'] },
  { icon: Sparkles, title: 'AI Ad Generation', items: ['Facebook ad copy (headline, text, CTA)', 'Google Search ads (headlines, descriptions, sitelinks)', 'Video ad scripts with timestamps', 'Scroll-stopping hooks', 'CTA suggestions', 'Full multi-platform campaign briefs'] },
  { icon: FolderOpen, title: 'Project Management', items: ['Organize by brand or client', 'Store analyses and generations per project', 'Competitor tracking per project', 'Full project history and audit trail'] },
  { icon: Download, title: 'Export & Reports', items: ['Export project data as JSON', 'PDF export architecture ready', 'Usage tracking and limits per plan', 'Share results with clients or team'] },
  { icon: Shield, title: 'Security & Auth', items: ['JWT access + refresh token authentication', 'Bcrypt password hashing (12 rounds)', 'AES-256-GCM encrypted API key storage', 'Rate limiting on all endpoints', 'Stripe webhook signature verification'] },
  { icon: Zap, title: 'Built for Scale', items: ['PostgreSQL database with Prisma ORM', 'Redis caching and job queues', 'Provider abstraction for AI and intelligence', 'Docker-ready deployment', 'Atomic usage limit enforcement'] },
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
            <div key={f.title} className="rounded-xl border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center"><f.icon className="h-5 w-5 text-primary" /></div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <ul className="space-y-2">{f.items.map(item => <li key={item} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-1">•</span>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
