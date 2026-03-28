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

const CATEGORY_INFO: Record<string, { title: string; icon: string; description: string }> = {
  ai: { title: 'AI Providers', icon: '🧠', description: 'Configure which AI models power analysis and ad generation.' },
  payment: { title: 'Payment Processors', icon: '💳', description: 'Set up payment gateways for subscriptions and billing.' },
  email: { title: 'Email / SMTP', icon: '📧', description: 'Configure email delivery for notifications, password resets, and invoices.' },
  general: { title: 'General', icon: '⚙️', description: 'Platform-wide configuration.' },
};

export function AdminSystemPage() {
  const [schema, setSchema] = useState<Record<string, { key: string; label: string; hasValue: boolean; sensitive: boolean }[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    adminApi.getProviderSchema().then(r => setSchema(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (key: string) => {
    if (!editValue.trim()) return;
    setSaving(true); setMessage('');
    try {
      await adminApi.saveProviderSetting(key, editValue);
      setMessage(`${key} saved`);
      setEditing(null); setEditValue('');
      load();
    } catch { setMessage('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Remove ${key}?`)) return;
    try { await adminApi.deleteProviderSetting(key); load(); } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="System Settings" description="Configure AI providers, payment processors, email, and platform settings. Keys are encrypted with AES-256-GCM." />
      {message && <div className="mb-4 bg-green-500/10 text-green-400 text-sm p-3 rounded-lg">{message}</div>}
      <div className="space-y-8 max-w-3xl">
        {schema && Object.entries(schema).map(([category, settings]) => {
          const info = CATEGORY_INFO[category] || { title: category, icon: '📦', description: '' };
          return (
            <div key={category} className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="p-5 border-b border-border/50 bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">{info.icon} {info.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
              </div>
              <div className="divide-y divide-border/50">
                {settings.map(s => (
                  <div key={s.key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.hasValue ? (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">Configured</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">Not set</span>
                        )}
                        {editing === s.key ? null : (
                          <>
                            <button onClick={() => { setEditing(s.key); setEditValue(''); }} className="text-xs text-primary hover:underline">{s.hasValue ? 'Update' : 'Set'}</button>
                            {s.hasValue && <button onClick={() => handleDelete(s.key)} className="text-xs text-destructive hover:underline">Remove</button>}
                          </>
                        )}
                      </div>
                    </div>
                    {editing === s.key && (
                      <div className="flex gap-2 mt-3">
                        <input
                          type={s.sensitive ? 'password' : 'text'}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder={`Enter ${s.label}...`}
                          autoFocus
                        />
                        <button onClick={() => handleSave(s.key)} disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Save</button>
                        <button onClick={() => setEditing(null)} className="border border-border px-3 py-2 rounded-lg text-sm hover:bg-muted/50">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
