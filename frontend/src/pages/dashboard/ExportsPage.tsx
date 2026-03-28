import { useEffect, useState } from 'react';
import { exportsApi } from '@/api/exports';
import { PageHeader, LoadingSpinner, DataTable } from '@/components/shared';
import type { ExportRecord } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { exportsApi.list().then(r => setExports(r.data.data)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <PageHeader title="Exports" description="Download history for your exported projects." />
      <DataTable columns={[
        { key: 'project', header: 'Project', render: (r: ExportRecord) => <span className="font-medium">{r.project?.title || r.projectId}</span> },
        { key: 'type', header: 'Type', render: (r: ExportRecord) => <span className="text-sm">{r.type}</span> },
        { key: 'createdAt', header: 'Exported', render: (r: ExportRecord) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
      ]} data={exports} isLoading={loading} emptyTitle="No exports yet" emptyDescription="Export a project to see it here." />
    </div>
  );
}
