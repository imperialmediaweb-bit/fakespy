import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/shared';
import { Search } from 'lucide-react';
import { api } from '@/api/client';
import { formatDateTime } from '@/lib/utils';
import type { Analysis } from '@/types/api';

export default function AnalysesListPage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analyses from all user projects
    api.get('/projects', { params: { page: 1, limit: 100 } }).then(async (res) => {
      const projects = res.data.data.projects;
      const allAnalyses: Analysis[] = [];
      for (const p of projects) {
        try {
          const a = await api.get(`/projects/${p.id}/analyses`);
          const items = a.data.data.map((item: Analysis) => ({ ...item, project: { id: p.id, title: p.title, brandName: p.brandName } }));
          allAnalyses.push(...items);
        } catch {}
      }
      allAnalyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnalyses(allAnalyses);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analyses..." />;

  return (
    <div>
      <PageHeader title="Analyses" description="All your competitive intelligence analyses across projects." />
      {analyses.length === 0 ? (
        <EmptyState icon={Search} title="No analyses yet" description="Run an analysis from a project to get started." action={<Link to="/dashboard/projects" className="text-sm text-primary hover:underline">Go to Projects</Link>} />
      ) : (
        <div className="space-y-3">
          {analyses.map(a => (
            <Link key={a.id} to={`/dashboard/analyses/${a.id}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{a.project?.title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground">{a.sourceType} · {formatDateTime(a.createdAt)}</p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
