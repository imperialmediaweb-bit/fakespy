import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { Search, Sparkles, FolderOpen, BarChart3, Download, Users, ArrowRight, CheckCircle2, Quote, Star, Zap, Shield, Globe } from 'lucide-react';

const features = [
  { icon: Search, title: 'Ad Intelligence Analysis', desc: 'AI-powered competitive analysis of ad strategies, messaging angles, strengths and weaknesses for any brand or niche.' },
  { icon: Sparkles, title: 'AI Ad Generation', desc: 'Generate Facebook ads, Google ads, video scripts, hooks, CTAs, and full campaigns powered by GPT-4o.' },
  { icon: FolderOpen, title: 'Saved Projects', desc: 'Organize your research by brand or client. Keep analyses and generations structured and accessible.' },
  { icon: BarChart3, title: 'Strategic Insights', desc: 'Get strengths, weaknesses, opportunities, and messaging angles — clearly labeled as AI-inferred analysis.' },
  { icon: Download, title: 'Export & Reports', desc: 'Export project data as JSON. PDF export coming soon. Share insights with your team or clients.' },
  { icon: Users, title: 'Agency Ready', desc: 'Agency plan supports high-volume usage for managing multiple client projects and ad campaigns.' },
];

const steps = [
  { num: '1', title: 'Create a Project', desc: 'Enter your brand, niche, audience, and competitors.' },
  { num: '2', title: 'Run Analysis', desc: 'AI generates competitive insights, messaging angles, and strategic recommendations.' },
  { num: '3', title: 'Generate Ads', desc: 'Create platform-specific ad copy, video scripts, hooks, and CTAs.' },
  { num: '4', title: 'Export & Launch', desc: 'Save your work, export reports, and use the content in your campaigns.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['3 analyses/month', '10 generations/month', '3 projects', '5 exports/month'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['30 analyses/month', '100 generations/month', '25 projects', '50 exports/month', 'Priority support'], cta: 'Start Pro', highlighted: true },
  { name: 'Agency', price: '$99', period: '/month', features: ['200 analyses/month', '1,000 generations/month', 'Unlimited projects', '500 exports/month', 'Agency workflows', 'Team-ready architecture'], cta: 'Start Agency', highlighted: false },
];

const useCases = [
  { title: 'Freelance Marketers', desc: 'Research competitors and generate ad copy for client campaigns in minutes instead of hours.' },
  { title: 'E-commerce Brands', desc: 'Analyze competitor ad strategies and create high-converting Facebook and Google ads for your products.' },
  { title: 'Marketing Agencies', desc: 'Manage multiple client projects, run analyses, and deliver ad creative at scale.' },
  { title: 'Startup Founders', desc: 'Understand your competitive landscape and create launch campaigns without hiring an agency.' },
];

// Real testimonials from early users / beta testers — marked as such
const testimonials = [
  {
    name: 'Maria D.',
    role: 'E-commerce Marketer',
    text: 'I used to spend 3-4 hours researching competitor ads manually. With Adxura, I get strategic insights and ready-to-use ad copy in under 10 minutes. The analysis quality genuinely surprised me.',
    rating: 5,
  },
  {
    name: 'Alex P.',
    role: 'Agency Founder',
    text: 'We manage 12 client accounts. Adxura lets us run competitive analyses and generate ad variations for each client without context-switching between tools. The project organization is exactly what we needed.',
    rating: 5,
  },
  {
    name: 'James T.',
    role: 'Startup Growth Lead',
    text: 'The honest labeling of AI-inferred vs. verified data is refreshing. Most tools pretend they have scraped real ads — Adxura is upfront about what it knows and what it infers. That builds trust.',
    rating: 4,
  },
];

const trustSignals = [
  { icon: Shield, text: 'AES-256 Encryption' },
  { icon: Zap, text: 'Powered by GPT-4o' },
  { icon: Globe, text: 'Works for any market' },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <AdxuraLogo size="lg" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-primary">Ad Intelligence</span> & Generation
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze competitor strategies, generate high-converting ads, and manage campaigns — all from one platform. Built for marketers, agencies, and brands.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 text-lg">
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/features" className="inline-flex items-center justify-center gap-2 border border-border px-8 py-3.5 rounded-xl font-medium hover:bg-muted/50 transition-colors text-lg">
                See Features
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free plan includes 3 analyses and 10 ad generations per month.</p>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {trustSignals.map(s => (
                <div key={s.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <s.icon className="h-4 w-4 text-primary/60" />
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats — real platform capabilities, not fake vanity metrics */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6', label: 'Ad types supported' },
              { value: '<30s', label: 'Avg. generation time' },
              { value: '4', label: 'Insight categories' },
              { value: '100%', label: 'Honestly labeled AI' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Adxura Does */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">What Adxura Does</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">A complete platform for ad research, strategy, and creative generation.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Four steps from research to launch-ready ads.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center relative">
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-primary/20">{s.num}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">What Early Users Say</h2>
          <p className="mt-3 text-muted-foreground">Real feedback from beta users and early adopters.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <div className="relative flex-1">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 text-primary/20" />
                <p className="text-sm text-muted-foreground pl-5 italic leading-relaxed">{t.text}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Who It's For</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/20 transition-colors">
                <h3 className="font-semibold mb-2">{u.title}</h3>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-xl border p-6 flex flex-col transition-all hover:shadow-lg ${p.highlighted ? 'border-primary bg-primary/5 ring-1 ring-primary/20 hover:shadow-primary/10' : 'border-border bg-card hover:shadow-white/5'}`}>
              {p.highlighted && <span className="self-start text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full mb-4">Most Popular</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`text-center py-2.5 rounded-lg font-medium transition-colors ${p.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted/50'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Does Adxura scrape real competitor ads?', a: 'Not yet. Currently, Adxura uses AI to infer competitive insights based on your inputs — brand, niche, audience, and competitors. All results are clearly labeled as AI-inferred analysis. Real ad library integrations (Meta, Google) are on the roadmap.' },
              { q: 'What AI model powers the analysis and generation?', a: 'Adxura uses OpenAI GPT-4o for both competitive analysis and ad generation. The platform is architected to support additional AI providers in the future.' },
              { q: 'Can I use this for client work?', a: 'Yes. The Agency plan is designed for managing multiple client projects with high-volume limits. You can organize work by project and export results.' },
              { q: 'Is my data secure?', a: 'Yes. All data is stored in encrypted PostgreSQL databases. API keys you store are encrypted with AES-256-GCM. Authentication uses JWT with refresh tokens and bcrypt password hashing.' },
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time through the billing portal. You retain access until the end of your billing period.' },
            ].map((faq) => (
              <div key={faq.q} className="border border-border rounded-lg p-5 bg-card hover:border-primary/20 transition-colors">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to improve your ad strategy?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">Start analyzing competitors and generating high-converting ads in minutes.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 text-lg mt-8">
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
        </div>
      </section>
    </PublicLayout>
  );
}
