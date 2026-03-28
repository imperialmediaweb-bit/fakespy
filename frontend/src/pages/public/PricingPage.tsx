import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  { name: 'Free', price: '$0', period: '/mo', features: ['3 analyses/month', '10 generations/month', '3 projects', '5 exports/month', 'Basic support'], cta: 'Get Started', highlighted: false },
  { name: 'Pro', price: '$29', period: '/mo', features: ['30 analyses/month', '100 generations/month', '25 projects', '50 exports/month', 'Priority support', 'All generation types'], cta: 'Start Pro', highlighted: true },
  { name: 'Agency', price: '$99', period: '/mo', features: ['200 analyses/month', '1,000 generations/month', 'Unlimited projects', '500 exports/month', 'Agency workflows', 'Team-ready architecture', 'Dedicated support'], cta: 'Start Agency', highlighted: false },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-3 text-muted-foreground text-lg">Start free. Scale as you grow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(p => (
            <div key={p.name} className={`rounded-xl border p-8 flex flex-col ${p.highlighted ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'}`}>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-4 mb-8"><span className="text-5xl font-bold">{p.price}</span><span className="text-muted-foreground">{p.period}</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>)}
              </ul>
              <Link to="/register" className={`text-center py-3 rounded-lg font-medium transition-colors ${p.highlighted ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted/50'}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
