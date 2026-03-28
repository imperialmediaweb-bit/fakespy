import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { PageHeader, LoadingSpinner, EmptyState, DataTable } from '@/components/shared';
import { Plus, FolderOpen } from 'lucide-react';
import type { Project, Pagination } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = (p: number) => {
    setLoading(true);
    projectsApi.list(p, 20).then(r => { setProjects(r.data.data.projects); setPagination(r.data.data.pagination); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  return (
    <div>
      <PageHeader title="Projects" description="Manage your brand analysis projects." actions={<Link to="/dashboard/projects/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Project</Link>} />
      <DataTable
        columns={[
          { key: 'title', header: 'Project', render: (r: Project) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.brandName}</p></div> },
          { key: 'niche', header: 'Niche', render: (r: Project) => <span className="text-sm text-muted-foreground">{r.niche || '—'}</span> },
          { key: 'analyses', header: 'Analyses', render: (r: Project) => <span className="text-sm">{r._count?.analyses || 0}</span> },
          { key: 'generations', header: 'Generations', render: (r: Project) => <span className="text-sm">{r._count?.adGenerations || 0}</span> },
          { key: 'createdAt', header: 'Created', render: (r: Project) => <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span> },
        ]}
        data={projects}
        isLoading={loading}
        emptyTitle="No projects yet"
        emptyDescription="Create your first project to start analyzing and generating ads."
        onRowClick={(r) => navigate(`/dashboard/projects/${r.id}`)}
      />
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
