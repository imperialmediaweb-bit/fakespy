import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generationsApi } from '@/api/generations';
import { PageHeader, LoadingSpinner, ErrorState } from '@/components/shared';
import type { AdGeneration } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

export default function GenerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gen, setGen] = useState<AdGeneration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (id) generationsApi.get(id).then(r => setGen(r.data.data)).catch(e => setError(e.response?.data?.error?.message || 'Failed')).finally(() => setLoading(false)); }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !gen) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title={gen.type.replace(/_/g, ' ')} description={`${gen.project?.brandName || ''} · ${formatDateTime(gen.createdAt)}`} />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">Input</h3>
          <div className="text-sm space-y-1.5 text-muted-foreground">
            {gen.tone && <p><strong>Tone:</strong> {gen.tone}</p>}
            {gen.audience && <p><strong>Audience:</strong> {gen.audience}</p>}
            {gen.objective && <p><strong>Objective:</strong> {gen.objective}</p>}
            {gen.tokensUsed && <p><strong>Tokens Used:</strong> {gen.tokensUsed}</p>}
            {gen.estimatedCost != null && <p><strong>Est. Cost:</strong> ${gen.estimatedCost.toFixed(4)}</p>}
          </div>
        </div>
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-3">Generated Output</h3>
          <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[600px] text-muted-foreground">{JSON.stringify(gen.output, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
