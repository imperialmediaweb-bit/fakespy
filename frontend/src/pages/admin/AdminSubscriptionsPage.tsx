import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, DataTable, StatusBadge, Pagination } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { AdminSubscription, Pagination as PaginationType } from '@/types/api';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  const load = () => {
    setLoading(true); setError('');
    adminApi.getSubscriptions(page, 20)
      .then(r => { setSubs(r.data.data.subscriptions); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load subscriptions')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title="Subscriptions" description="Plan and billing status for every account. Changes to paid plans are made through Stripe and synced here by webhook." />
      <DataTable columns={[
        { key: 'user', header: 'User', render: (r: AdminSubscription) => <div><p className="font-medium">{r.user?.name || '—'}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div> },
        { key: 'plan', header: 'Plan', render: (r: AdminSubscription) => <StatusBadge status={r.plan} /> },
        { key: 'status', header: 'Status', render: (r: AdminSubscription) => <StatusBadge status={r.status} /> },
        { key: 'periodEnd', header: 'Period ends', render: (r: AdminSubscription) => <span className="text-sm text-muted-foreground">{r.currentPeriodEnd ? formatDate(r.currentPeriodEnd) : '—'}</span> },
        { key: 'cancel', header: 'Cancelling', render: (r: AdminSubscription) => <span className={`text-xs ${r.cancelAtPeriodEnd ? 'text-yellow-400' : 'text-muted-foreground'}`}>{r.cancelAtPeriodEnd ? 'At period end' : 'No'}</span> },
        { key: 'createdAt', header: 'Since', render: (r: AdminSubscription) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
      ]} data={subs} isLoading={loading} error={error} onRetry={load} emptyTitle="No subscriptions" />
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />}
    </div>
  );
}
