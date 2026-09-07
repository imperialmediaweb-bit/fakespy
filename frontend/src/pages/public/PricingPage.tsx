import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSeo, PUBLIC_ROUTE_SEO } from '@/lib/seo';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  { name: 'Free', price: 0, features: ['3 analyses / month', '10 generations / month', '3 projects', '5 exports / month', 'All 6 ad types', 'Ad scoring & variations'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: 29, features: ['30 analyses / month', '100 generations / month', '25 projects', '50 exports / month', 'All 6 ad types', 'Ad scoring & variations', 'Audience profiles', 'Priority support'], cta: 'Start Pro', highlighted: true },
  { name: 'Agency', price: 99, features: ['200 analyses / month', '1,000 generations / month', 'Unlimited projects', '500 exports / month', 'Agency dashboard (clients grouped by brand)', 'Everything in Pro', 'Dedicated support'], cta: 'Start Agency', highlighted: false },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Adxura',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: plans.map(p => ({ '@type': 'Offer', name: `${p.name} plan`, price: p.price, priceCurrency: 'USD', category: 'subscription' })),
};

export default function PricingPage() {
  useSeo({ ...PUBLIC_ROUTE_SEO['/pricing'], canonical: '/pricing', jsonLd });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-3 text-muted-foreground text-lg">Start free. Scale as you grow. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(p => (
            <section key={p.name} aria-labelledby={`plan-${p.name}`} className={`rounded-xl border p-8 flex flex-col ${p.highlighted ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'}`}>
              {p.highlighted && <span className="self-start text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-full mb-4">Most popular</span>}
              <h2 id={`plan-${p.name}`} className="text-xl font-semibold">{p.name}</h2>
              <p className="mt-4 mb-8"><span className="text-5xl font-bold">${p.price}</span><span className="text-muted-foreground">/mo</span></p>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />{f}</li>)}
              </ul>
              <Link to="/register" className={`text-center py-3 rounded-lg font-medium transition-colors ${p.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted/50'}`}>{p.cta}</Link>
            </section>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-10">Generation credits are also used by ad scoring, audience profiles and ad variations. Quotas reset monthly. Payments are processed securely by Stripe.</p>
      </div>
    </PublicLayout>
  );
}
