import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, DataTable, StatusBadge, Pagination } from '@/components/shared';
import { formatDate } from '@/lib/utils';
import type { AdminUser, Pagination as PaginationType } from '@/types/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationType | null>(null);

  const load = () => {
    setLoading(true); setError('');
    adminApi.getUsers(page, 20)
      .then(r => { setUsers(r.data.data.users); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load users')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title="Users" description={pagination ? `${pagination.total} registered users` : 'All registered users.'} />
      <DataTable columns={[
        { key: 'name', header: 'Name', render: (r: AdminUser) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
        { key: 'role', header: 'Role', render: (r: AdminUser) => <StatusBadge status={r.role} /> },
        { key: 'plan', header: 'Plan', render: (r: AdminUser) => <StatusBadge status={r.subscription?.plan || 'FREE'} /> },
        { key: 'status', header: 'Sub status', render: (r: AdminUser) => r.subscription ? <StatusBadge status={r.subscription.status} /> : <span className="text-xs text-muted-foreground">—</span> },
        { key: 'verified', header: 'Verified', render: (r: AdminUser) => <span className={`text-xs ${r.emailVerified ? 'text-green-400' : 'text-muted-foreground'}`}>{r.emailVerified ? 'Yes' : 'No'}</span> },
        { key: 'createdAt', header: 'Joined', render: (r: AdminUser) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
      ]} data={users} isLoading={loading} error={error} onRetry={load} emptyTitle="No users" />
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />}
    </div>
  );
}
