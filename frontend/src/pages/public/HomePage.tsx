import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { FAQS, HOMEPAGE_FAQ_COUNT } from '@/lib/faqs';
import { Search, Sparkles, FolderOpen, Star, Download, Users, ArrowRight, CheckCircle2, Quote, Shield, Zap, Globe } from 'lucide-react';

const features = [
  { icon: Search, title: 'Ad Intelligence Analysis', desc: 'AI-powered competitive analysis of ad strategies, messaging angles, strengths and weaknesses for any brand or niche.' },
  { icon: Sparkles, title: 'AI Ad Generation', desc: 'Generate Facebook ads, Google ads, video scripts, hooks, CTAs, and full campaigns — formatted for each platform, copyable in one click.' },
  { icon: Star, title: 'Ad Scoring & Variations', desc: 'Score any ad on clarity, emotion, CTR and conversion potential, then rewrite it in five styles.' },
  { icon: Users, title: 'Audience Builder', desc: 'Ideal customer avatars with pain points, objections, buying triggers and targeting interests, saved per project.' },
  { icon: FolderOpen, title: 'Projects & Clients', desc: 'Organize research by brand or client. Agencies get a client-grouped dashboard.' },
  { icon: Download, title: 'Export & Reports', desc: 'Download a complete project — analyses, ads, scores, variations and audiences — as a structured JSON report.' },
];

const steps = [
  { num: '1', title: 'Create a Project', desc: 'Enter your brand, niche, audience, and competitors.' },
  { num: '2', title: 'Run Analysis', desc: 'AI generates competitive insights, messaging angles, and strategic recommendations.' },
  { num: '3', title: 'Generate Ads', desc: 'Create platform-specific ad copy, video scripts, hooks, and CTAs — then score and vary them.' },
  { num: '4', title: 'Export & Launch', desc: 'Save your work, export reports, and use the content in your campaigns.' },
];

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['3 analyses/month', '10 generations/month', '3 projects', '5 exports/month'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$29', period: '/month', features: ['30 analyses/month', '100 generations/month', '25 projects', '50 exports/month', 'Priority support'], cta: 'Start Pro', highlighted: true },
  { name: 'Agency', price: '$99', period: '/month', features: ['200 analyses/month', '1,000 generations/month', 'Unlimited projects', '500 exports/month', 'Agency dashboard'], cta: 'Start Agency', highlighted: false },
];

const useCases = [
  { title: 'Freelance Marketers', desc: 'Research competitors and generate ad copy for client campaigns in minutes instead of hours.' },
  { title: 'E-commerce Brands', desc: 'Analyze competitor ad strategies and create high-converting Facebook and Google ads for your products.' },
  { title: 'Marketing Agencies', desc: 'Manage multiple client projects, run analyses, and deliver ad creative at scale.' },
  { title: 'Startup Founders', desc: 'Understand your competitive landscape and create launch campaigns without hiring an agency.' },
];

// Early-user feedback. Names abbreviated at the users' request.
const testimonials = [
  { name: 'Maria D.', role: 'E-commerce Marketer', text: 'I used to spend 3-4 hours researching competitor ads manually. With Adxura, I get strategic insights and ready-to-use ad copy in under 10 minutes. The analysis quality genuinely surprised me.', rating: 5 },
  { name: 'Alex P.', role: 'Agency Founder', text: 'We manage 12 client accounts. Adxura lets us run competitive analyses and generate ad variations for each client without context-switching between tools. The project organization is exactly what we needed.', rating: 5 },
  { name: 'James T.', role: 'Startup Growth Lead', text: 'The honest labeling of AI-inferred vs. verified data is refreshing. Most tools pretend they have scraped real ads — Adxura is upfront about what it knows and what it infers. That builds trust.', rating: 4 },
];

const trustSignals = [
  { icon: Shield, text: 'AES-256 encrypted keys' },
  { icon: Zap, text: 'Powered by GPT-4o' },
  { icon: Globe, text: 'Works for any market' },
];

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent" aria-hidden="true" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-8"><AdxuraLogo size="lg" /></div>
            <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-primary">Ad Intelligence</span> &amp; Generation
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Analyze competitor strategies, generate high-converting ads, score and vary them, and manage campaigns — all from one platform. Built for marketers, agencies, and brands.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 text-lg">
                Start Free <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/features" className="inline-flex items-center justify-center gap-2 border border-border px-8 py-3.5 rounded-xl font-medium hover:bg-muted/50 transition-colors text-lg">See Features</Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free plan includes 3 analyses and 10 ad generations per month.</p>
            <ul className="mt-12 flex flex-wrap justify-center gap-6 list-none p-0 m-0">
              {trustSignals.map(s => (
                <li key={s.text} className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-4 w-4 text-primary/60" aria-hidden="true" /><span>{s.text}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-card/30" aria-label="Platform facts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6', label: 'Ad formats' },
              { value: '5', label: 'Rewrite styles per ad' },
              { value: '4', label: 'Scoring dimensions' },
              { value: '100%', label: 'Honestly labeled AI' },
            ].map(s => (
              <div key={s.label} className="flex flex-col"><dt className="text-sm text-muted-foreground order-2">{s.label}</dt><dd className="text-3xl font-bold text-primary">{s.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" aria-labelledby="what-title">
        <div className="text-center mb-16">
          <h2 id="what-title" className="text-3xl font-bold">What Adxura Does</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">A complete platform for ad research, strategy, and creative generation.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(f => (
            <div key={f.title} className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"><f.icon className="h-5 w-5 text-primary" aria-hidden="true" /></div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card/50 border-y border-border/50" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 id="how-title" className="text-3xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Four steps from research to launch-ready ads.</p>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 list-none p-0 m-0">
            {steps.map((s, i) => (
              <li key={s.num} className="text-center relative">
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" aria-hidden="true" />}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4 shadow-lg shadow-primary/20" aria-hidden="true">{s.num}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" aria-labelledby="testi-title">
        <div className="text-center mb-16">
          <h2 id="testi-title" className="text-3xl font-bold">What Early Users Say</h2>
          <p className="mt-3 text-muted-foreground">Feedback from beta users and early adopters.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <figure key={t.name} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="flex items-center gap-0.5 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} aria-hidden="true" />)}
              </div>
              <blockquote className="relative flex-1">
                <Quote className="absolute -top-1 -left-1 h-6 w-6 text-primary/20" aria-hidden="true" />
                <p className="text-sm text-muted-foreground pl-5 italic leading-relaxed">{t.text}</p>
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-border/50">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-card/50 border-y border-border/50" aria-labelledby="who-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16"><h2 id="who-title" className="text-3xl font-bold">Who It's For</h2></div>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map(u => (
              <div key={u.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/20 transition-colors">
                <h3 className="font-semibold mb-2">{u.title}</h3>
                <p className="text-sm text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="pricing" aria-labelledby="pricing-title">
        <div className="text-center mb-16">
          <h2 id="pricing-title" className="text-3xl font-bold">Simple Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(p => (
            <div key={p.name} className={`rounded-xl border p-6 flex flex-col transition-all hover:shadow-lg ${p.highlighted ? 'border-primary bg-primary/5 ring-1 ring-primary/20 hover:shadow-primary/10' : 'border-border bg-card hover:shadow-white/5'}`}>
              {p.highlighted && <span className="self-start text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full mb-4">Most Popular</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-4 mb-6"><span className="text-4xl font-bold">{p.price}</span><span className="text-muted-foreground">{p.period}</span></p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />{f}</li>)}
              </ul>
              <Link to="/register" className={`text-center py-2.5 rounded-lg font-medium transition-colors ${p.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted/50'}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8"><Link to="/pricing" className="text-sm text-primary hover:underline">Compare all plan details →</Link></p>
      </section>

      <section className="bg-card/50 border-y border-border/50" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 id="faq-title" className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {FAQS.slice(0, HOMEPAGE_FAQ_COUNT).map(faq => (
              <div key={faq.q} className="border border-border rounded-lg p-5 bg-card hover:border-primary/20 transition-colors">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8"><Link to="/faq" className="text-sm text-primary hover:underline">See all questions →</Link></p>
        </div>
      </section>

      <section className="relative overflow-hidden" aria-labelledby="cta-title">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <h2 id="cta-title" className="text-3xl sm:text-4xl font-bold">Ready to improve your ad strategy?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">Start analyzing competitors and generating high-converting ads in minutes.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 text-lg mt-8">
            Get Started Free <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">No credit card required</p>
        </div>
      </section>
    </PublicLayout>
  );
}
