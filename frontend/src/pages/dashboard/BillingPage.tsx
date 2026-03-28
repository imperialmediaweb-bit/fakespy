import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { billingApi } from '@/api/billing';
import { settingsApi } from '@/api/settings';
import { PageHeader, LoadingSpinner, StatusBadge, UsageBar } from '@/components/shared';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { Plan, Usage } from '@/types/api';
import { PLAN_LIMITS } from '@/types/api';
import { formatDate } from '@/lib/utils';

const plans: { plan: Plan; name: string; price: string; features: string[] }[] = [
  { plan: 'FREE', name: 'Free', price: '$0/mo', features: ['3 analyses', '10 generations', '3 projects'] },
  { plan: 'PRO', name: 'Pro', price: '$29/mo', features: ['30 analyses', '100 generations', '25 projects'] },
  { plan: 'AGENCY', name: 'Agency', price: '$99/mo', features: ['200 analyses', '1,000 generations', 'Unlimited projects'] },
];

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [subInfo, setSubInfo] = useState<{ plan: Plan; status: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');

  useEffect(() => {
    Promise.all([billingApi.getSubscription(), settingsApi.getSettings()])
      .then(([s, settings]) => { setSubInfo(s.data.data); setUsage(settings.data.data.usage); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: 'PRO' | 'AGENCY') => {
    setUpgrading(plan);
    try {
      const { data } = await billingApi.createCheckoutSession(plan);
      if (data.data.url) window.location.href = data.data.url;
    } catch (err: any) { alert(err.response?.data?.error?.message || 'Failed to start checkout'); }
    finally { setUpgrading(''); }
  };

  const handlePortal = async () => {
    try {
      const { data } = await billingApi.createPortalSession();
      if (data.data.url) window.location.href = data.data.url;
    } catch (err: any) { alert(err.response?.data?.error?.message || 'Billing portal unavailable'); }
  };

  if (loading) return <LoadingSpinner />;
  const currentPlan = subInfo?.plan || 'FREE';
  const limits = PLAN_LIMITS[currentPlan];

  return (
    <div>
      <PageHeader title="Billing" description="Manage your subscription and usage." />
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">Current Plan</h3>
          <div className="flex items-center gap-3 mb-3"><span className="text-2xl font-bold">{currentPlan}</span><StatusBadge status={subInfo?.status || 'ACTIVE'} /></div>
          {subInfo?.currentPeriodEnd && <p className="text-sm text-muted-foreground">Renews {formatDate(subInfo.currentPeriodEnd)}</p>}
          {subInfo?.cancelAtPeriodEnd && <p className="text-sm text-yellow-400 mt-1">Cancels at end of period</p>}
          {currentPlan !== 'FREE' && <button onClick={handlePortal} className="mt-4 text-sm text-primary hover:underline">Manage subscription</button>}
        </div>
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">This Month's Usage</h3>
          {usage && (
            <div className="space-y-3">
              <UsageBar label="Analyses" used={usage.analysesUsed} limit={limits.analysesPerMonth} />
              <UsageBar label="Generations" used={usage.generationsUsed} limit={limits.generationsPerMonth} />
              <UsageBar label="Exports" used={usage.exportsUsed} limit={limits.exportsPerMonth} />
            </div>
          )}
        </div>
      </div>
      <h3 className="font-semibold mb-4">Available Plans</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.plan} className={`border rounded-xl p-6 ${p.plan === currentPlan ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <h4 className="font-semibold">{p.name}</h4>
            <p className="text-2xl font-bold mt-2 mb-4">{p.price}</p>
            <ul className="space-y-2 mb-6">{p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{f}</li>)}</ul>
            {p.plan === currentPlan ? <span className="text-sm text-primary font-medium">Current plan</span>
              : p.plan === 'FREE' ? null
              : <button onClick={() => handleUpgrade(p.plan as 'PRO' | 'AGENCY')} disabled={!!upgrading} className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {upgrading === p.plan && <Loader2 className="h-4 w-4 animate-spin" />} Upgrade
                </button>}
          </div>
        ))}
      </div>
    </div>
  );
}
