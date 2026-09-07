import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportsApi } from '@/api/exports';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, DataTable } from '@/components/shared';
import type { ExportRecord } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    exportsApi.list().then(r => setExports(r.data.data)).catch(err => setError(getApiErrorMessage(err, 'Could not load exports'))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Exports" description="History of your exported project reports. Exports download immediately from the project page." />
      <DataTable columns={[
        { key: 'project', header: 'Project', render: (r: ExportRecord) => r.project ? <Link to={`/dashboard/projects/${r.projectId}`} className="font-medium hover:text-primary">{r.project.title}</Link> : <span className="text-muted-foreground">Deleted project</span> },
        { key: 'type', header: 'Format', render: (r: ExportRecord) => <span className="text-sm">{r.type}</span> },
        { key: 'contents', header: 'Contents', render: (r: ExportRecord) => {
          const m = (r.metadata || {}) as Record<string, number>;
          return <span className="text-xs text-muted-foreground">{[m.totalAnalyses != null && `${m.totalAnalyses} analyses`, m.totalGenerations != null && `${m.totalGenerations} ads`, m.audienceProfiles != null && `${m.audienceProfiles} audiences`].filter(Boolean).join(' · ') || '—'}</span>;
        } },
        { key: 'createdAt', header: 'Exported', render: (r: ExportRecord) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
      ]} data={exports} isLoading={loading} error={error} onRetry={load} emptyTitle="No exports yet" emptyDescription="Open a project and click Export to download a full JSON report." />
    </div>
  );
}
