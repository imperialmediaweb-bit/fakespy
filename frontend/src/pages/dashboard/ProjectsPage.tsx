import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, DataTable, Pagination, btnPrimary } from '@/components/shared';
import { Plus } from 'lucide-react';
import type { Project, Pagination as PaginationType } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true); setError('');
    projectsApi.list(page, 20)
      .then(r => { setProjects(r.data.data.projects); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load projects')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title="Projects" description="Manage your brand analysis projects." actions={<Link to="/dashboard/projects/new" className={`${btnPrimary} px-4 py-2 text-sm`}><Plus className="h-4 w-4" aria-hidden="true" /> New Project</Link>} />
      <DataTable
        columns={[
          { key: 'title', header: 'Project', render: (r: Project) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.brandName}</p></div> },
          { key: 'niche', header: 'Niche', render: (r: Project) => <span className="text-sm text-muted-foreground">{r.niche || '—'}</span> },
          { key: 'analyses', header: 'Analyses', render: (r: Project) => <span className="text-sm tabular-nums">{r._count?.analyses || 0}</span> },
          { key: 'generations', header: 'Generations', render: (r: Project) => <span className="text-sm tabular-nums">{r._count?.adGenerations || 0}</span> },
          { key: 'createdAt', header: 'Created', render: (r: Project) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
        ]}
        data={projects}
        isLoading={loading}
        error={error}
        onRetry={load}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to start analyzing and generating ads."
        onRowClick={(r) => navigate(`/dashboard/projects/${r.id}`)}
        rowLabel={(r) => `Open project ${r.title}`}
      />
      {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />}
    </div>
  );
}
