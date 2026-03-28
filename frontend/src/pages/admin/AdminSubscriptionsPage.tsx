import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { PageHeader, DataTable, StatusBadge } from '@/components/shared';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getSubscriptions(1, 50).then(r => setSubs(r.data.data.subscriptions)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <PageHeader title="Subscriptions" description="All user subscriptions." />
      <DataTable columns={[
        { key: 'user', header: 'User', render: (r: any) => <div><p className="font-medium">{r.user?.name}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div> },
        { key: 'plan', header: 'Plan', render: (r: any) => <StatusBadge status={r.plan} /> },
        { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        { key: 'cancel', header: 'Canceling', render: (r: any) => <span className="text-sm text-muted-foreground">{r.cancelAtPeriodEnd ? 'Yes' : 'No'}</span> },
      ]} data={subs} isLoading={loading} emptyTitle="No subscriptions" />
    </div>
  );
}
