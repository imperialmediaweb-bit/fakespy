import { useEffect, useState } from 'react';
import { billingApi } from '@/api/billing';
import { settingsApi } from '@/api/settings';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge, UsageBar, InlineAlert, btnPrimary } from '@/components/shared';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import type { Plan, Usage, SubscriptionInfo } from '@/types/api';
import { PLAN_LIMITS } from '@/types/api';
import { formatDate } from '@/lib/utils';

const PLANS: { plan: Plan; name: string; price: string; features: string[] }[] = [
  { plan: 'FREE', name: 'Free', price: '$0/mo', features: ['3 analyses / month', '10 generations / month', '5 exports / month', '3 projects'] },
  { plan: 'PRO', name: 'Pro', price: '$29/mo', features: ['30 analyses / month', '100 generations / month', '50 exports / month', '25 projects', 'Priority support'] },
  { plan: 'AGENCY', name: 'Agency', price: '$99/mo', features: ['200 analyses / month', '1,000 generations / month', '500 exports / month', 'Unlimited projects', 'Agency dashboard'] },
];

export default function BillingPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState<'PRO' | 'AGENCY' | 'portal' | ''>('');

  const load = () => {
    setLoading(true); setError('');
    Promise.all([billingApi.getSubscription(), settingsApi.getSettings()])
      .then(([s, settings]) => { setSub(s.data.data); setUsage(settings.data.data.usage); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load billing information')))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleUpgrade = async (plan: 'PRO' | 'AGENCY') => {
    setBusy(plan); setActionError('');
    try {
      const { data } = await billingApi.createCheckoutSession(plan);
      if (data.data.url) { window.location.href = data.data.url; return; }
      setActionError('Checkout could not be started. Please try again.');
    } catch (err) { setActionError(getApiErrorMessage(err, 'Failed to start checkout')); }
    finally { setBusy(''); }
  };

  const handlePortal = async () => {
    setBusy('portal'); setActionError('');
    try {
      const { data } = await billingApi.createPortalSession();
      if (data.data.url) { window.location.href = data.data.url; return; }
      setActionError('Billing portal is unavailable right now.');
    } catch (err) { setActionError(getApiErrorMessage(err, 'Billing portal unavailable')); }
    finally { setBusy(''); }
  };

  if (loading) return <LoadingSpinner text="Loading billing..." />;
  // Never fall back to FREE on error — a paying customer must not be shown an "Upgrade" button by mistake.
  if (error || !sub) return <ErrorState message={error || 'Subscription status unavailable'} onRetry={load} />;

  const currentPlan = sub.plan;
  const limits = PLAN_LIMITS[currentPlan];
  const isPaid = currentPlan !== 'FREE';
  const rank: Record<Plan, number> = { FREE: 0, PRO: 1, AGENCY: 2 };

  return (
    <div>
      <PageHeader title="Billing" description="Manage your subscription and usage." />
      {actionError && <div className="mb-4"><InlineAlert onDismiss={() => setActionError('')}>{actionError}</InlineAlert></div>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="bill-plan">
          <h2 id="bill-plan" className="font-semibold mb-3">Current Plan</h2>
          <div className="flex items-center gap-3 mb-3"><span className="text-2xl font-bold">{currentPlan}</span><StatusBadge status={String(sub.status)} /></div>
          {sub.status === 'PAST_DUE' && <InlineAlert kind="error">Your last payment failed. Update your payment method to keep access.</InlineAlert>}
          {sub.currentPeriodEnd && <p className="text-sm text-muted-foreground mt-2">{sub.cancelAtPeriodEnd ? 'Access ends' : 'Renews'} {formatDate(sub.currentPeriodEnd)}</p>}
          {sub.cancelAtPeriodEnd && <p className="text-sm text-yellow-400 mt-1">Cancellation scheduled — you keep full access until the period ends.</p>}
          {isPaid && (
            <button type="button" onClick={handlePortal} disabled={busy === 'portal'} className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50">
              {busy === 'portal' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
              Manage subscription, invoices &amp; payment method
            </button>
          )}
        </section>
        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="bill-usage">
          <h2 id="bill-usage" className="font-semibold mb-3">This Month's Usage</h2>
          {usage ? (
            <div className="space-y-3">
              <UsageBar label="Analyses" used={usage.analysesUsed} limit={limits.analysesPerMonth} />
              <UsageBar label="Generations" used={usage.generationsUsed} limit={limits.generationsPerMonth} />
              <UsageBar label="Exports" used={usage.exportsUsed} limit={limits.exportsPerMonth} />
            </div>
          ) : <p className="text-sm text-muted-foreground">Usage unavailable.</p>}
          <p className="text-xs text-muted-foreground mt-4">Ad scoring, audience profiles and variations also use generation credits. Quotas reset on the 1st of each month.</p>
        </section>
      </div>

      <h2 className="font-semibold mb-4">Plans</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map(p => {
          const isCurrent = p.plan === currentPlan;
          const isUpgrade = rank[p.plan] > rank[currentPlan];
          return (
            <div key={p.plan} className={`border rounded-xl p-6 flex flex-col ${isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-2xl font-bold mt-2 mb-4">{p.price}</p>
              <ul className="space-y-2 mb-6 flex-1">{p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />{f}</li>)}</ul>
              {isCurrent ? <span className="text-sm text-primary font-medium">Current plan</span>
                : isUpgrade ? (
                  <button type="button" onClick={() => handleUpgrade(p.plan as 'PRO' | 'AGENCY')} disabled={!!busy} className={`${btnPrimary} w-full py-2 text-sm`}>
                    {busy === p.plan && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Upgrade to {p.name}
                  </button>
                ) : isPaid ? (
                  <button type="button" onClick={handlePortal} disabled={!!busy} className="w-full py-2 text-sm border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50">Change in billing portal</button>
                ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
