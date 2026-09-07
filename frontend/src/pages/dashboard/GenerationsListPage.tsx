import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { generationsApi } from '@/api/generations';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState, Pagination } from '@/components/shared';
import { Sparkles } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { AdGeneration, Pagination as PaginationType } from '@/types/api';

export default function GenerationsListPage() {
  const [generations, setGenerations] = useState<AdGeneration[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    generationsApi.list(page, 20)
      .then(r => { setGenerations(r.data.data.generations); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load generations')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  return (
    <div>
      <PageHeader title="Generations" description="All your AI-generated ads across projects." />
      {loading ? <LoadingSpinner text="Loading generations..." /> : error ? <ErrorState message={error} onRetry={load} /> : generations.length === 0 ? (
        <EmptyState icon={Sparkles} title="No generations yet" description="Generate ads from a project to get started." action={<Link to="/dashboard/projects" className="text-sm text-primary hover:underline">Go to Projects</Link>} />
      ) : (
        <>
          <ul className="space-y-3 list-none p-0 m-0">
            {generations.map(g => (
              <li key={g.id}>
                <Link to={`/dashboard/generations/${g.id}`} className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{g.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground truncate">{g.project?.title || 'Untitled project'} · {formatDateTime(g.createdAt)}{g.tone ? ` · ${g.tone}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {g.adScore && <p className={`text-sm font-semibold tabular-nums ${g.adScore.overallScore >= 75 ? 'text-green-400' : g.adScore.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{g.adScore.overallScore}/100</p>}
                    {g.tokensUsed != null && <p className="text-xs text-muted-foreground tabular-nums">{g.tokensUsed} tokens</p>}
                  </div>
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
