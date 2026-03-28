import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analysesApi } from '@/api/analyses';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge } from '@/components/shared';
import type { Analysis, IntelligenceInsight } from '@/types/api';

function InsightList({ title, items }: { title: string; items: IntelligenceInsight[] | null }) {
  if (!items || items.length === 0) return null;
  const confColor: Record<string, string> = { high: 'text-green-400', medium: 'text-yellow-400', low: 'text-gray-400' };
  return (
    <div className="border border-border rounded-xl bg-card p-6">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`shrink-0 text-xs mt-0.5 ${confColor[item.confidence] || ''}`}>[{item.confidence}]</span>
            <span className="text-muted-foreground">{item.content}</span>
            <span className="shrink-0 text-xs text-muted-foreground/50 ml-auto">{item.origin}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    if (!id) return;
    setLoading(true);
    analysesApi.get(id).then(r => setAnalysis(r.data.data)).catch(e => setError(e.response?.data?.error?.message || 'Failed')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); const interval = setInterval(() => { if (analysis?.status === 'PENDING' || analysis?.status === 'PROCESSING') load(); }, 3000); return () => clearInterval(interval); }, [id, analysis?.status]);

  if (loading) return <LoadingSpinner text="Loading analysis..." />;
  if (error || !analysis) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="Analysis Results" description={`${analysis.project?.brandName || ''} · ${analysis.sourceType}`} actions={<StatusBadge status={analysis.status} />} />
      {(analysis.status === 'PENDING' || analysis.status === 'PROCESSING') && <LoadingSpinner text="Analysis in progress... This page will auto-refresh." />}
      {analysis.status === 'FAILED' && <ErrorState message={analysis.errorMessage || 'Analysis failed'} onRetry={() => analysesApi.rerun(analysis.id).then(load)} />}
      {analysis.status === 'COMPLETED' && (
        <div className="space-y-6">
          {analysis.disclaimers && analysis.disclaimers.length > 0 && (
            <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4">
              <p className="text-xs font-medium text-yellow-400 mb-2">Disclaimers</p>
              {analysis.disclaimers.map((d, i) => <p key={i} className="text-xs text-muted-foreground">{d}</p>)}
            </div>
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
