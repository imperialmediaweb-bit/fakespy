import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analysesApi } from '@/api/analyses';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState, StatusBadge, Pagination } from '@/components/shared';
import { Search } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { Analysis, Pagination as PaginationType } from '@/types/api';

export default function AnalysesListPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    analysesApi.list(page, 20)
      .then(r => { setAnalyses(r.data.data.analyses); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load analyses')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title="Analyses" description="All your competitive intelligence analyses across projects." />
      {loading ? <LoadingSpinner text="Loading analyses..." /> : error ? <ErrorState message={error} onRetry={load} /> : analyses.length === 0 ? (
        <EmptyState icon={Search} title="No analyses yet" description="Run an analysis from a project to get started." action={<Link to="/dashboard/projects" className="text-sm text-primary hover:underline">Go to Projects</Link>} />
      ) : (
        <>
          <ul className="space-y-3 list-none p-0 m-0">
            {analyses.map(a => (
              <li key={a.id}>
                <Link to={`/dashboard/analyses/${a.id}`} className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.project?.title || 'Untitled project'}<span className="text-muted-foreground font-normal"> · {a.project?.brandName}</span></p>
                    <p className="text-xs text-muted-foreground">{a.sourceType.replace(/_/g, ' ')} · {formatDateTime(a.createdAt)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
          {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={setPage} />}
        </>
      )}
    </div>
  );
}
