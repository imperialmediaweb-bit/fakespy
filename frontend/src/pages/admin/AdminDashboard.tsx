import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { PageHeader, LoadingSpinner } from '@/components/shared';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getUsageStats().then(r => setStats(r.data.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform overview and metrics." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0 },
          { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0 },
          { label: 'Analyses This Month', value: stats?.monthlyUsage?.totalAnalyses || 0 },
          { label: 'Generations This Month', value: stats?.monthlyUsage?.totalGenerations || 0 },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
