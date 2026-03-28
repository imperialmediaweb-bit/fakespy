import { useEffect, useState } from 'react';
import { PageHeader, LoadingSpinner, DataTable, StatusBadge } from '@/components/shared';
import { adminApi } from '@/api/admin';
import { formatDateTime } from '@/lib/utils';

interface AdminDataPageProps {
  title: string;
  description?: string;
  fetchFn: (page: number, limit: number) => Promise<any>;
  dataKey: string;
  columns: { key: string; header: string; render?: (row: any) => any }[];
}

function AdminDataPageInner({ title, description, fetchFn, dataKey, columns }: AdminDataPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchFn(page, 20).then(r => { setData(r.data.data[dataKey]); setPagination(r.data.data.pagination); }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title={title} description={description} />
      <DataTable columns={columns} data={data} isLoading={loading} emptyTitle={`No ${title.toLowerCase()}`} />
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-30 hover:bg-muted/50">Previous</button>
          <span className="px-3 py-1.5 text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-30 hover:bg-muted/50">Next</button>
        </div>
      )}
    </div>
  );
}

export function AdminProjectsPage() {
  return <AdminDataPageInner title="Projects" description="All projects across all users." fetchFn={adminApi.getProjects} dataKey="projects" columns={[
    { key: 'title', header: 'Project', render: (r: any) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.brandName}</p></div> },
    { key: 'user', header: 'Owner', render: (r: any) => <span className="text-sm text-muted-foreground">{r.user?.name} ({r.user?.email})</span> },
    { key: 'analyses', header: 'Analyses', render: (r: any) => <span className="text-sm">{r._count?.analyses || 0}</span> },
    { key: 'generations', header: 'Generations', render: (r: any) => <span className="text-sm">{r._count?.adGenerations || 0}</span> },
    { key: 'createdAt', header: 'Created', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminAnalysesPage() {
  return <AdminDataPageInner title="Analyses" description="All analyses across all users." fetchFn={adminApi.getAnalyses} dataKey="analyses" columns={[
    { key: 'project', header: 'Project', render: (r: any) => <span className="text-sm">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: (r: any) => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'sourceType', header: 'Source', render: (r: any) => <span className="text-xs text-muted-foreground">{r.sourceType}</span> },
    { key: 'createdAt', header: 'Created', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminGenerationsPage() {
  return <AdminDataPageInner title="Generations" description="All ad generations across all users." fetchFn={adminApi.getGenerations} dataKey="generations" columns={[
    { key: 'type', header: 'Type', render: (r: any) => <span className="text-sm font-medium">{r.type?.replace(/_/g, ' ')}</span> },
    { key: 'project', header: 'Project', render: (r: any) => <span className="text-sm text-muted-foreground">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: (r: any) => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'tokens', header: 'Tokens', render: (r: any) => <span className="text-sm">{r.tokensUsed || '—'}</span> },
    { key: 'createdAt', header: 'Created', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminExportsPage() {
  return <AdminDataPageInner title="Exports" description="All exports across all users." fetchFn={adminApi.getExports} dataKey="exports" columns={[
    { key: 'project', header: 'Project', render: (r: any) => <span className="text-sm">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: (r: any) => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'type', header: 'Type', render: (r: any) => <span className="text-sm">{r.type}</span> },
    { key: 'createdAt', header: 'Created', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminAuditLogsPage() {
  return <AdminDataPageInner title="Audit Logs" description="All system audit events." fetchFn={adminApi.getAuditLogs} dataKey="logs" columns={[
    { key: 'action', header: 'Action', render: (r: any) => <span className="text-sm font-mono text-primary">{r.action}</span> },
    { key: 'user', header: 'User', render: (r: any) => <span className="text-sm text-muted-foreground">{r.user?.name} ({r.user?.email})</span> },
    { key: 'metadata', header: 'Details', render: (r: any) => <span className="text-xs text-muted-foreground max-w-xs truncate block">{r.metadata ? JSON.stringify(r.metadata) : '—'}</span> },
    { key: 'createdAt', header: 'Time', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminUsagePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminApi.getUsageStats().then(r => setStats(r.data.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <PageHeader title="Usage Overview" description={`Current month: ${stats?.currentMonth}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: stats?.totalUsers },
          { label: 'Paid Subscriptions', value: stats?.activeSubscriptions },
          { label: 'Total Projects', value: stats?.totalProjects },
          { label: 'Total Analyses (all time)', value: stats?.totalAnalyses },
          { label: 'Total Generations (all time)', value: stats?.totalGenerations },
          { label: 'Analyses This Month', value: stats?.monthlyUsage?.totalAnalyses },
          { label: 'Generations This Month', value: stats?.monthlyUsage?.totalGenerations },
          { label: 'Exports This Month', value: stats?.monthlyUsage?.totalExports },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSystemPage() {
  return (
    <div>
      <PageHeader title="System Settings" description="Platform configuration." />
      <div className="space-y-6 max-w-2xl">
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">Platform Info</h3>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p><strong className="text-foreground">Version:</strong> 1.0.0</p>
            <p><strong className="text-foreground">Environment:</strong> Production</p>
            <p><strong className="text-foreground">AI Provider:</strong> OpenAI (GPT-4o)</p>
            <p><strong className="text-foreground">Payment Provider:</strong> Stripe</p>
            <p><strong className="text-foreground">Database:</strong> PostgreSQL via Prisma</p>
          </div>
        </div>
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">Provider Integrations</h3>
          <div className="space-y-3">
            {[
              { name: 'OpenAI API', status: 'Configured', desc: 'Used for analysis and generation' },
              { name: 'Stripe', status: 'Configured', desc: 'Handles subscriptions and billing' },
              { name: 'SMTP Email', status: 'Optional', desc: 'For transactional emails — falls back to console logging' },
              { name: 'Redis', status: 'Configured', desc: 'Webhook idempotency and rate limiting' },
              { name: 'Meta Ad Library', status: 'Planned', desc: 'Real ad intelligence — future integration' },
              { name: 'Google Ads Transparency', status: 'Planned', desc: 'Real ad intelligence — future integration' },
            ].map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${p.status === 'Configured' ? 'bg-green-500/10 text-green-400 border-green-500/20' : p.status === 'Planned' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
