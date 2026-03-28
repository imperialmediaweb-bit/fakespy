import { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { PageHeader, DataTable, StatusBadge } from '@/components/shared';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => { adminApi.getUsers(page, 20).then(r => { setUsers(r.data.data.users); setPagination(r.data.data.pagination); }).finally(() => setLoading(false)); }, [page]);

  return (
    <div>
      <PageHeader title="Users" description="All registered users." />
      <DataTable columns={[
        { key: 'name', header: 'Name', render: (r: any) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
        { key: 'role', header: 'Role', render: (r: any) => <StatusBadge status={r.role} /> },
        { key: 'plan', header: 'Plan', render: (r: any) => <StatusBadge status={r.subscription?.plan || 'FREE'} /> },
        { key: 'verified', header: 'Verified', render: (r: any) => <span className={`text-xs ${r.emailVerified ? 'text-green-400' : 'text-muted-foreground'}`}>{r.emailVerified ? 'Yes' : 'No'}</span> },
        { key: 'createdAt', header: 'Joined', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
      ]} data={users} isLoading={loading} emptyTitle="No users" />
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-30">Previous</button>
          <span className="px-3 py-1.5 text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
