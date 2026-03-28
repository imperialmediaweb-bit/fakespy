import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { analysesApi } from '@/api/analyses';
import { generationsApi } from '@/api/generations';
import { exportsApi } from '@/api/exports';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge, EmptyState } from '@/components/shared';
import { Search, Sparkles, Download, Loader2 } from 'lucide-react';
import type { Project, Analysis, AdGeneration } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [generations, setGenerations] = useState<AdGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<'overview' | 'analyses' | 'generations'>('overview');

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([projectsApi.get(id), analysesApi.listByProject(id), generationsApi.listByProject(id)])
      .then(([p, a, g]) => { setProject(p.data.data); setAnalyses(a.data.data); setGenerations(g.data.data); })
      .catch(e => setError(e.response?.data?.error?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const runAnalysis = async () => {
    if (!project) return;
    setRunningAnalysis(true);
    try {
      await analysesApi.create({ projectId: project.id, brandName: project.brandName, niche: project.niche || undefined, location: project.location || undefined, targetAudience: project.targetAudience || undefined, productDescription: project.productDescription || undefined, competitors: project.competitors?.length ? project.competitors : undefined });
      setTimeout(load, 2000);
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed'); }
    finally { setRunningAnalysis(false); }
  };

  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    try {
      const { data } = await exportsApi.exportProject(project.id);
      const blob = new Blob([JSON.stringify(data.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${project.title}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(err.response?.data?.error?.message || 'Export failed'); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner text="Loading project..." />;
  if (error || !project) return <ErrorState message={error} onRetry={load} />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'analyses', label: `Analyses (${analyses.length})` },
    { key: 'generations', label: `Generations (${generations.length})` },
  ] as const;

  return (
    <div>
      <PageHeader title={project.title} description={`${project.brandName}${project.niche ? ' · ' + project.niche : ''}`} actions={
        <div className="flex gap-2">
          <button onClick={runAnalysis} disabled={runningAnalysis} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {runningAnalysis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Run Analysis
          </button>
          <Link to={`/dashboard/projects/${id}/generate`} className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/50">
            <Sparkles className="h-4 w-4" /> Generate Ads
          </Link>
          <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/50 disabled:opacity-50">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export
          </button>
        </div>
      } />

      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>)}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl bg-card p-6 space-y-3">
            <h3 className="font-semibold">Project Details</h3>
            <div className="text-sm space-y-2">
              <div><span className="text-muted-foreground">Brand:</span> {project.brandName}</div>
              {project.niche && <div><span className="text-muted-foreground">Niche:</span> {project.niche}</div>}
              {project.location && <div><span className="text-muted-foreground">Market:</span> {project.location}</div>}
              {project.targetAudience && <div><span className="text-muted-foreground">Audience:</span> {project.targetAudience}</div>}
              {project.productDescription && <div><span className="text-muted-foreground">Description:</span> {project.productDescription}</div>}
              {project.competitors?.length > 0 && <div><span className="text-muted-foreground">Competitors:</span> {project.competitors.join(', ')}</div>}
            </div>
          </div>
          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold">{analyses.length}</p><p className="text-xs text-muted-foreground">Analyses</p></div>
              <div><p className="text-2xl font-bold">{generations.length}</p><p className="text-xs text-muted-foreground">Generations</p></div>
              <div><p className="text-2xl font-bold">{analyses.filter(a => a.status === 'COMPLETED').length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'analyses' && (
        analyses.length === 0 ? <EmptyState icon={Search} title="No analyses yet" description="Run your first analysis to get competitive insights." /> : (
          <div className="space-y-3">{analyses.map(a => (
            <Link key={a.id} to={`/dashboard/analyses/${a.id}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
              <div><p className="text-sm font-medium">Analysis · {a.sourceType}</p><p className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p></div>
              <StatusBadge status={a.status} />
            </Link>
          ))}</div>
        )
      )}

      {tab === 'generations' && (
        generations.length === 0 ? <EmptyState icon={Sparkles} title="No generations yet" description="Generate ads to start creating content." /> : (
          <div className="space-y-3">{generations.map(g => (
            <Link key={g.id} to={`/dashboard/generations/${g.id}`} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
              <div><p className="text-sm font-medium">{g.type.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{formatDateTime(g.createdAt)}{g.tone ? ` · ${g.tone}` : ''}</p></div>
              <span className="text-xs text-muted-foreground">{g.tokensUsed ? `${g.tokensUsed} tokens` : ''}</span>
            </Link>
          ))}</div>
        )
      )}
    </div>
  );
}
