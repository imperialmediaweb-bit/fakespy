import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { analysesApi } from '@/api/analyses';
import { generationsApi } from '@/api/generations';
import { exportsApi } from '@/api/exports';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge, EmptyState, InlineAlert, TabBar, btnPrimary, btnSecondary } from '@/components/shared';
import { Search, Sparkles, Download, Loader2, Users } from 'lucide-react';
import type { Project, Analysis, AdGeneration } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

type Tab = 'overview' | 'analyses' | 'generations';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [generations, setGenerations] = useState<AdGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  const load = () => {
    if (!id) return;
    setLoading(true); setError('');
    Promise.all([projectsApi.get(id), analysesApi.listByProject(id), generationsApi.listByProject(id)])
      .then(([p, a, g]) => { setProject(p.data.data); setAnalyses(a.data.data); setGenerations(g.data.data); })
      .catch(err => setError(getApiErrorMessage(err, 'Failed to load project')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const runAnalysis = async () => {
    if (!project) return;
    setRunningAnalysis(true); setActionError(''); setNotice('');
    try {
      const { data } = await analysesApi.create({ projectId: project.id, brandName: project.brandName, niche: project.niche || undefined, location: project.location || undefined, targetAudience: project.targetAudience || undefined, productDescription: project.productDescription || undefined, competitors: project.competitors?.length ? project.competitors : undefined });
      setAnalyses(prev => [data.data, ...prev]);
      setNotice('Analysis started — open it to watch progress.');
      setTab('analyses');
    } catch (err) { setActionError(getApiErrorMessage(err, 'Could not start analysis')); }
    finally { setRunningAnalysis(false); }
  };

  const handleExport = async () => {
    if (!project) return;
    setExporting(true); setActionError('');
    try {
      const { data } = await exportsApi.exportProject(project.id);
      const blob = new Blob([JSON.stringify(data.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${project.title.replace(/[^\w-]+/g, '_')}.json`; a.click();
      URL.revokeObjectURL(url);
      setNotice('Export downloaded.');
    } catch (err) { setActionError(getApiErrorMessage(err, 'Export failed')); }
    finally { setExporting(false); }
  };

  if (loading) return <LoadingSpinner text="Loading project..." />;
  if (error || !project) return <ErrorState message={error || 'Project not found'} onRetry={load} />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'analyses', label: `Analyses (${analyses.length})` },
    { key: 'generations', label: `Generations (${generations.length})` },
  ];

  return (
    <div>
      <PageHeader title={project.title} description={`${project.brandName}${project.niche ? ' · ' + project.niche : ''}`} actions={
        <>
          <button type="button" onClick={runAnalysis} disabled={runningAnalysis} className={`${btnPrimary} px-4 py-2 text-sm`}>
            {runningAnalysis ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />} Run Analysis
          </button>
          <Link to={`/dashboard/projects/${id}/generate`} className={`${btnSecondary} px-4 py-2 text-sm`}><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate Ads</Link>
          <Link to={`/dashboard/projects/${id}/audience`} className={`${btnSecondary} px-4 py-2 text-sm`}><Users className="h-4 w-4" aria-hidden="true" /> Audience</Link>
          <button type="button" onClick={handleExport} disabled={exporting} className={`${btnSecondary} px-4 py-2 text-sm`}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />} Export
          </button>
        </>
      } />

      {actionError && <div className="mb-4"><InlineAlert onDismiss={() => setActionError('')}>{actionError}</InlineAlert></div>}
      {notice && <div className="mb-4"><InlineAlert kind="success" onDismiss={() => setNotice('')}>{notice}</InlineAlert></div>}

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="border border-border rounded-xl bg-card p-6 space-y-3" aria-labelledby="proj-details">
            <h2 id="proj-details" className="font-semibold">Project Details</h2>
            <dl className="text-sm space-y-2">
              <div><dt className="inline text-muted-foreground">Brand: </dt><dd className="inline">{project.brandName}</dd></div>
              {project.niche && <div><dt className="inline text-muted-foreground">Niche: </dt><dd className="inline">{project.niche}</dd></div>}
              {project.location && <div><dt className="inline text-muted-foreground">Market: </dt><dd className="inline">{project.location}</dd></div>}
              {project.targetAudience && <div><dt className="inline text-muted-foreground">Audience: </dt><dd className="inline">{project.targetAudience}</dd></div>}
              {project.productDescription && <div><dt className="inline text-muted-foreground">Description: </dt><dd className="inline">{project.productDescription}</dd></div>}
              {project.competitors?.length > 0 && <div><dt className="inline text-muted-foreground">Competitors: </dt><dd className="inline">{project.competitors.join(', ')}</dd></div>}
            </dl>
          </section>
          <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="proj-stats">
            <h2 id="proj-stats" className="font-semibold mb-3">Quick Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold tabular-nums">{analyses.length}</p><p className="text-xs text-muted-foreground">Analyses</p></div>
              <div><p className="text-2xl font-bold tabular-nums">{generations.length}</p><p className="text-xs text-muted-foreground">Generations</p></div>
              <div><p className="text-2xl font-bold tabular-nums">{analyses.filter(a => a.status === 'COMPLETED').length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
            </div>
          </section>
        </div>
      )}

      {tab === 'analyses' && (
        analyses.length === 0 ? <EmptyState icon={Search} title="No analyses yet" description="Run your first analysis to get competitive insights." /> : (
          <ul className="space-y-3 list-none p-0 m-0">{analyses.map(a => (
            <li key={a.id}>
              <Link to={`/dashboard/analyses/${a.id}`} className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                <div><p className="text-sm font-medium">Analysis · {a.sourceType.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p></div>
                <StatusBadge status={a.status} />
              </Link>
            </li>
          ))}</ul>
        )
      )}

      {tab === 'generations' && (
        generations.length === 0 ? <EmptyState icon={Sparkles} title="No generations yet" description="Generate ads to start creating content." action={<Link to={`/dashboard/projects/${id}/generate`} className={`${btnPrimary} px-4 py-2 text-sm`}>Generate Ads</Link>} /> : (
          <ul className="space-y-3 list-none p-0 m-0">{generations.map(g => (
            <li key={g.id}>
              <Link to={`/dashboard/generations/${g.id}`} className="flex items-center justify-between gap-3 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                <div><p className="text-sm font-medium">{g.type.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{formatDateTime(g.createdAt)}{g.tone ? ` · ${g.tone}` : ''}</p></div>
                <span className="text-xs text-muted-foreground tabular-nums">{g.tokensUsed ? `${g.tokensUsed} tokens` : ''}</span>
              </Link>
            </li>
          ))}</ul>
        )
      )}
    </div>
  );
}
