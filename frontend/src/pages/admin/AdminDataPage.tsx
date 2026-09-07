import { useEffect, useState, type ReactNode } from 'react';
import { PageHeader, LoadingSpinner, ErrorState, DataTable, StatusBadge, Pagination, InlineAlert, inputClass, btnPrimary, btnSecondary } from '@/components/shared';
import { adminApi, type ProviderSetting } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import { formatDateTime } from '@/lib/utils';
import { Brain, CreditCard, Mail, Settings, Loader2, type LucideIcon } from 'lucide-react';
import type { AdminUsageStats, AuditLog, Pagination as PaginationType } from '@/types/api';

type Row = Record<string, any>;

interface AdminDataPageProps {
  title: string;
  description?: string;
  fetchFn: (page: number, limit: number) => Promise<{ data: { data: Record<string, unknown> } }>;
  dataKey: string;
  columns: { key: string; header: string; render?: (row: any) => ReactNode }[];
}

function AdminDataPageInner({ title, description, fetchFn, dataKey, columns }: AdminDataPageProps) {
  const [data, setData] = useState<Row[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true); setError('');
    fetchFn(page, 20)
      .then(r => { setData(r.data.data[dataKey] as Row[]); setPagination(r.data.data.pagination as PaginationType); })
      .catch(err => setError(getApiErrorMessage(err, `Could not load ${title.toLowerCase()}`)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title={title} description={pagination ? `${pagination.total} total${description ? ` · ${description}` : ''}` : description} />
      <DataTable columns={columns} data={data} isLoading={loading} error={error} onRetry={load} emptyTitle={`No ${title.toLowerCase()}`} />
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />}
    </div>
  );
}

export function AdminProjectsPage() {
  return <AdminDataPageInner title="Projects" description="across all users" fetchFn={adminApi.getProjects} dataKey="projects" columns={[
    { key: 'title', header: 'Project', render: r => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.brandName}</p></div> },
    { key: 'user', header: 'Owner', render: r => <span className="text-sm text-muted-foreground">{r.user?.name} ({r.user?.email})</span> },
    { key: 'analyses', header: 'Analyses', render: r => <span className="text-sm tabular-nums">{r._count?.analyses || 0}</span> },
    { key: 'generations', header: 'Generations', render: r => <span className="text-sm tabular-nums">{r._count?.adGenerations || 0}</span> },
    { key: 'createdAt', header: 'Created', render: r => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminAnalysesPage() {
  return <AdminDataPageInner title="Analyses" description="across all users" fetchFn={adminApi.getAnalyses} dataKey="analyses" columns={[
    { key: 'project', header: 'Project', render: r => <span className="text-sm">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: r => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'sourceType', header: 'Source', render: r => <span className="text-xs text-muted-foreground">{String(r.sourceType || '').replace(/_/g, ' ')}</span> },
    { key: 'createdAt', header: 'Created', render: r => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminGenerationsPage() {
  return <AdminDataPageInner title="Generations" description="AI generation log across all users" fetchFn={adminApi.getGenerations} dataKey="generations" columns={[
    { key: 'type', header: 'Type', render: r => <span className="text-sm font-medium">{String(r.type || '').replace(/_/g, ' ')}</span> },
    { key: 'project', header: 'Project', render: r => <span className="text-sm text-muted-foreground">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: r => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'tokens', header: 'Tokens', render: r => <span className="text-sm tabular-nums">{r.tokensUsed ?? '—'}</span> },
    { key: 'cost', header: 'Est. cost', render: r => <span className="text-sm tabular-nums">{r.estimatedCost != null ? `$${Number(r.estimatedCost).toFixed(4)}` : '—'}</span> },
    { key: 'createdAt', header: 'Created', render: r => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminExportsPage() {
  return <AdminDataPageInner title="Exports" description="export log across all users" fetchFn={adminApi.getExports} dataKey="exports" columns={[
    { key: 'project', header: 'Project', render: r => <span className="text-sm">{r.project?.title || '—'}</span> },
    { key: 'user', header: 'User', render: r => <span className="text-sm text-muted-foreground">{r.user?.name}</span> },
    { key: 'type', header: 'Type', render: r => <span className="text-sm">{r.type}</span> },
    { key: 'createdAt', header: 'Created', render: r => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminAuditLogsPage() {
  return <AdminDataPageInner title="Audit Logs" description="security and billing events" fetchFn={adminApi.getAuditLogs} dataKey="logs" columns={[
    { key: 'action', header: 'Action', render: (r: AuditLog) => <span className="text-sm font-mono text-primary">{r.action}</span> },
    { key: 'user', header: 'User', render: (r: AuditLog) => <span className="text-sm text-muted-foreground">{r.user?.name} ({r.user?.email})</span> },
    { key: 'metadata', header: 'Details', render: (r: AuditLog) => <span className="text-xs text-muted-foreground max-w-xs truncate block" title={r.metadata ? JSON.stringify(r.metadata) : ''}>{r.metadata ? JSON.stringify(r.metadata) : '—'}</span> },
    { key: 'createdAt', header: 'Time', render: (r: AuditLog) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
  ]} />;
}

export function AdminUsagePage() {
  const [stats, setStats] = useState<AdminUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => {
    setLoading(true); setError('');
    adminApi.getUsageStats().then(r => setStats(r.data.data)).catch(err => setError(getApiErrorMessage(err, 'Could not load usage'))).finally(() => setLoading(false));
  };
  useEffect(load, []);
  if (loading) return <LoadingSpinner />;
  if (error || !stats) return <ErrorState message={error || 'Usage unavailable'} onRetry={load} />;
  return (
    <div>
      <PageHeader title="Usage Overview" description={`Current month: ${stats.currentMonth}`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total users', value: stats.totalUsers },
          { label: 'Paid subscriptions', value: stats.activeSubscriptions },
          { label: 'Total projects', value: stats.totalProjects },
          { label: 'Total analyses (all time)', value: stats.totalAnalyses },
          { label: 'Total generations (all time)', value: stats.totalGenerations },
          { label: 'Analyses this month', value: stats.monthlyUsage.totalAnalyses },
          { label: 'Generations this month', value: stats.monthlyUsage.totalGenerations },
          { label: 'Exports this month', value: stats.monthlyUsage.totalExports },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{s.value ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_INFO: Record<string, { title: string; icon: LucideIcon; description: string }> = {
  ai: { title: 'AI Providers', icon: Brain, description: 'Configure which AI models power analysis and ad generation.' },
  payment: { title: 'Payment Processors', icon: CreditCard, description: 'Set up payment gateways for subscriptions and billing. Stripe is the primary, fully wired provider.' },
  email: { title: 'Email / SMTP', icon: Mail, description: 'Configure email delivery for verification, password resets, and contact-form messages.' },
  general: { title: 'General', icon: Settings, description: 'Platform-wide configuration.' },
};

export function AdminSystemPage() {
  const [schema, setSchema] = useState<Record<string, ProviderSetting[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const load = () => {
    setLoadError('');
    adminApi.getProviderSchema().then(r => setSchema(r.data.data)).catch(err => setLoadError(getApiErrorMessage(err, 'Could not load settings'))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async (key: string) => {
    if (!editValue.trim()) return;
    setSaving(true); setMessage(''); setError('');
    try {
      await adminApi.saveProviderSetting(key, editValue.trim());
      setMessage(`${key} saved. It takes effect on the next request.`);
      setEditing(null); setEditValue('');
      load();
    } catch (err) { setError(getApiErrorMessage(err, 'Failed to save')); }
    finally { setSaving(false); }
  };

  const handleRemove = async (key: string) => {
    setMessage(''); setError('');
    try { await adminApi.deleteProviderSetting(key); setMessage(`${key} removed.`); load(); }
    catch (err) { setError(getApiErrorMessage(err, 'Failed to remove')); }
    finally { setConfirmRemove(null); }
  };

  if (loading) return <LoadingSpinner />;
  if (loadError || !schema) return <ErrorState message={loadError || 'Settings unavailable'} onRetry={load} />;

  return (
    <div>
      <PageHeader title="System Settings" description="Configure AI providers, payment processors, email, and platform settings. Secret values are encrypted with AES-256-GCM and never displayed again." />
      {message && <div className="mb-4"><InlineAlert kind="success" onDismiss={() => setMessage('')}>{message}</InlineAlert></div>}
      {error && <div className="mb-4"><InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert></div>}
      <div className="space-y-8 max-w-3xl">
        {Object.entries(schema).map(([category, settings]) => {
          const info = CATEGORY_INFO[category] || { title: category, icon: Settings, description: '' };
          const Icon = info.icon;
          return (
            <section key={category} className="border border-border rounded-xl bg-card overflow-hidden" aria-labelledby={`cat-${category}`}>
              <div className="p-5 border-b border-border/50 bg-muted/20">
                <h2 id={`cat-${category}`} className="font-semibold flex items-center gap-2"><Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {info.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
              </div>
              <div className="divide-y divide-border/50">
                {settings.map(s => (
                  <div key={s.key} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.label}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{s.key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.hasValue
                          ? <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">Configured</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">Not set</span>}
                        {editing !== s.key && confirmRemove !== s.key && (
                          <>
                            <button type="button" onClick={() => { setEditing(s.key); setEditValue(''); setConfirmRemove(null); }} className="text-xs text-primary hover:underline">{s.hasValue ? 'Update' : 'Set'}</button>
                            {s.hasValue && <button type="button" onClick={() => setConfirmRemove(s.key)} className="text-xs text-destructive hover:underline">Remove</button>}
                          </>
                        )}
                      </div>
                    </div>
                    {confirmRemove === s.key && (
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
                        <span className="text-muted-foreground">Remove {s.key}? Features depending on it will stop working.</span>
                        <button type="button" onClick={() => handleRemove(s.key)} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30">Yes, remove</button>
                        <button type="button" onClick={() => setConfirmRemove(null)} className={`${btnSecondary} text-xs px-3 py-1.5`}>Cancel</button>
                      </div>
                    )}
                    {editing === s.key && (
                      <form className="flex flex-col sm:flex-row gap-2 mt-3" onSubmit={e => { e.preventDefault(); handleSave(s.key); }}>
                        <label htmlFor={`setting-${s.key}`} className="sr-only">{s.label}</label>
                        <input id={`setting-${s.key}`} type={s.sensitive ? 'password' : 'text'} autoComplete="off" value={editValue} onChange={e => setEditValue(e.target.value)} className={`${inputClass} flex-1`} placeholder={`Enter ${s.label}...`} autoFocus />
                        <button type="submit" disabled={saving || !editValue.trim()} className={`${btnPrimary} px-4 py-2 text-sm`}>{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Save</button>
                        <button type="button" onClick={() => setEditing(null)} className={`${btnSecondary} px-3 py-2 text-sm`}>Cancel</button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
