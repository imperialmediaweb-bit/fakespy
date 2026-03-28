import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/shared';
import { Sparkles } from 'lucide-react';
import { api } from '@/api/client';
import { formatDateTime } from '@/lib/utils';
import type { AdGeneration } from '@/types/api';

export default function GenerationsListPage() {
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<AdGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects', { params: { page: 1, limit: 100 } }).then(async (res) => {
      const projects = res.data.data.projects;
      const allGens: AdGeneration[] = [];
      for (const p of projects) {
        try {
          const g = await api.get(`/projects/${p.id}/generations`);
          const items = g.data.data.map((item: AdGeneration) => ({ ...item, project: { id: p.id, title: p.title, brandName: p.brandName } }));
          allGens.push(...items);
        } catch {}
      }
      allGens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGenerations(allGens);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading generations..." />;

  return (
    <div>
      <PageHeader title="Generations" description="All your AI-generated ads across projects." />
      {generations.length === 0 ? (
        <EmptyState icon={Sparkles} title="No generations yet" description="Generate ads from a project to get started." action={<Link to="/dashboard/projects" className="text-sm text-primary hover:underline">Go to Projects</Link>} />
      ) : (
        <div className="space-y-3">
          {generations.map(g => (
            <Link key={g.id} to={`/dashboard/generations/${g.id}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
              <div>
                <p className="text-sm font-medium">{g.type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">{g.project?.title || 'Untitled'} · {formatDateTime(g.createdAt)}{g.tone ? ` · ${g.tone}` : ''}</p>
              </div>
              <span className="text-xs text-muted-foreground">{g.tokensUsed ? `${g.tokensUsed} tokens` : ''}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
