import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analysesApi } from '@/api/analyses';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge, InlineAlert, btnSecondary } from '@/components/shared';
import { Loader2 } from 'lucide-react';
import type { Analysis, IntelligenceInsight } from '@/types/api';

const POLL_MS = 3000;

function InsightList({ title, items }: { title: string; items: IntelligenceInsight[] | null }) {
  if (!items || items.length === 0) return null;
  const confColor: Record<string, string> = { high: 'text-green-400', medium: 'text-yellow-400', low: 'text-gray-400' };
  return (
    <section className="border border-border rounded-xl bg-card p-6" aria-labelledby={`ins-${title}`}>
      <h2 id={`ins-${title}`} className="font-semibold mb-3">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`shrink-0 text-xs mt-0.5 ${confColor[item.confidence] || ''}`} title={`${item.confidence} confidence`}>[{item.confidence}]</span>
            <span className="text-muted-foreground">{item.content}</span>
            <span className="shrink-0 text-xs text-muted-foreground/50 ml-auto">{item.origin.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rerunning, setRerunning] = useState(false);
  const [actionError, setActionError] = useState('');
  const pollRef = useRef<number | null>(null);

  // Initial load shows the spinner; background polls do not unmount the page.
  const fetchAnalysis = useCallback(async (background: boolean) => {
    if (!id) return;
    if (!background) { setLoading(true); setError(''); }
    try {
      const r = await analysesApi.get(id);
      setAnalysis(r.data.data);
    } catch (err) {
      if (!background) setError(getApiErrorMessage(err, 'Could not load analysis'));
    } finally {
      if (!background) setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAnalysis(false); }, [fetchAnalysis]);

  const inProgress = analysis?.status === 'PENDING' || analysis?.status === 'PROCESSING';
  useEffect(() => {
    if (!inProgress) return;
    pollRef.current = window.setInterval(() => fetchAnalysis(true), POLL_MS);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [inProgress, fetchAnalysis]);

  const handleRerun = async () => {
    if (!analysis) return;
    setRerunning(true); setActionError('');
    try { await analysesApi.rerun(analysis.id); await fetchAnalysis(false); }
    catch (err) { setActionError(getApiErrorMessage(err, 'Could not rerun analysis')); }
    finally { setRerunning(false); }
  };

  if (loading) return <LoadingSpinner text="Loading analysis..." />;
  if (error || !analysis) return <ErrorState message={error || 'Analysis not found'} onRetry={() => fetchAnalysis(false)} />;

  return (
    <div>
      <PageHeader title="Analysis Results" description={`${analysis.project?.brandName || ''} · ${analysis.sourceType.replace(/_/g, ' ')}`} actions={
        <>
          {analysis.project && <Link to={`/dashboard/projects/${analysis.projectId}`} className={`${btnSecondary} px-4 py-2 text-sm`}>Back to project</Link>}
          <StatusBadge status={analysis.status} />
        </>
      } />

      {actionError && <div className="mb-4"><InlineAlert onDismiss={() => setActionError('')}>{actionError}</InlineAlert></div>}

      {inProgress && (
        <div className="border border-border rounded-xl bg-card p-8 text-center" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium">Analysis in progress</p>
          <p className="text-sm text-muted-foreground mt-1">Usually takes 20–60 seconds. This page updates automatically.</p>
        </div>
      )}

      {analysis.status === 'FAILED' && (
        <ErrorState title="Analysis failed" message={analysis.errorMessage || 'The analysis could not be completed.'} onRetry={rerunning ? undefined : handleRerun} />
      )}

      {analysis.status === 'COMPLETED' && (
        <div className="space-y-6">
          {analysis.disclaimers && analysis.disclaimers.length > 0 && (
            <aside className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4">
              <p className="text-xs font-medium text-yellow-400 mb-2">How to read this analysis</p>
              {analysis.disclaimers.map((d, i) => <p key={i} className="text-xs text-muted-foreground">{d}</p>)}
            </aside>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <InsightList title="Strengths" items={analysis.strengths} />
            <InsightList title="Weaknesses" items={analysis.weaknesses} />
            <InsightList title="Opportunities" items={analysis.opportunities} />
            <InsightList title="Messaging Angles" items={analysis.messagingAngles} />
          </div>
          <InsightList title="Key Insights" items={analysis.inferredInsights} />
        </div>
      )}
    </div>
  );
}
