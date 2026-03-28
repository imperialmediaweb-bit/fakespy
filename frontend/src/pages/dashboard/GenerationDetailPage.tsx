import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generationsApi } from '@/api/generations';
import { adScoreApi, variationsApi } from '@/api/newModules';
import { PageHeader, LoadingSpinner, ErrorState } from '@/components/shared';
import { Loader2, Star, Zap } from 'lucide-react';
import type { AdGeneration } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}/100</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function GenerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gen, setGen] = useState<AdGeneration | null>(null);
  const [score, setScore] = useState<any>(null);
  const [variations, setVariations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [generatingVar, setGeneratingVar] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'output' | 'score' | 'variations'>('output');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      generationsApi.get(id),
      adScoreApi.get(id).catch(() => null),
      variationsApi.list(id).catch(() => ({ data: { data: [] } })),
    ]).then(([g, s, v]) => {
      setGen(g.data.data);
      if (s?.data?.data) setScore(s.data.data);
      setVariations(v.data.data || []);
    }).catch(e => setError(e.response?.data?.error?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleScore = async () => {
    if (!id) return;
    setScoring(true);
    try { const { data } = await adScoreApi.score(id); setScore(data.data); setTab('score'); }
    catch (err: any) { alert(err.response?.data?.error?.message || 'Scoring failed'); }
    finally { setScoring(false); }
  };

  const handleVariation = async (style: string) => {
    if (!id) return;
    setGeneratingVar(style);
    try {
      const { data } = await variationsApi.generate({ generationId: id, style });
      setVariations([data.data, ...variations]);
      setTab('variations');
    } catch (err: any) { alert(err.response?.data?.error?.message || 'Failed'); }
    finally { setGeneratingVar(''); }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !gen) return <ErrorState message={error} />;

  const styles = [
    { value: 'short', label: 'Short' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'direct_response', label: 'Direct Response' },
    { value: 'premium', label: 'Premium' },
    { value: 'urgency', label: 'Urgency' },
  ];
  const tabs = [
    { key: 'output', label: 'Original Output' },
    { key: 'score', label: `Ad Score${score ? ` (${score.overallScore}/100)` : ''}` },
    { key: 'variations', label: `Variations (${variations.length})` },
  ] as const;

  return (
    <div>
      <PageHeader title={gen.type.replace(/_/g, ' ')} description={`${gen.project?.brandName || ''} · ${formatDateTime(gen.createdAt)}`} actions={
        <div className="flex gap-2">
          {!score && <button onClick={handleScore} disabled={scoring} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {scoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />} Score Ad
          </button>}
        </div>
      } />

      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>)}
      </div>

      {tab === 'output' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-semibold mb-3">Input</h3>
            <div className="text-sm space-y-1.5 text-muted-foreground">
              {gen.tone && <p><strong className="text-foreground">Tone:</strong> {gen.tone}</p>}
              {gen.audience && <p><strong className="text-foreground">Audience:</strong> {gen.audience}</p>}
              {gen.objective && <p><strong className="text-foreground">Objective:</strong> {gen.objective}</p>}
              {gen.tokensUsed && <p><strong className="text-foreground">Tokens:</strong> {gen.tokensUsed}</p>}
              {gen.estimatedCost != null && <p><strong className="text-foreground">Cost:</strong> ${gen.estimatedCost.toFixed(4)}</p>}
            </div>
          </div>
          <div className="border border-border rounded-xl bg-card p-6">
            <h3 className="font-semibold mb-3">Generated Output</h3>
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[600px] text-muted-foreground">{JSON.stringify(gen.output, null, 2)}</pre>
          </div>
        </div>
      )}

      {tab === 'score' && (
        score ? (
          <div className="max-w-2xl space-y-6">
            <div className="border border-border rounded-xl bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ad Quality Score</h3>
                <span className={`text-2xl font-bold ${score.overallScore >= 75 ? 'text-green-400' : score.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{score.overallScore}/100</span>
              </div>
              <ScoreBar label="Clarity" value={score.clarityScore} />
              <ScoreBar label="Emotional Impact" value={score.emotionalImpact} />
              <ScoreBar label="CTR Potential" value={score.ctrPotential} />
              <ScoreBar label="Conversion Strength" value={score.conversionStrength} />
            </div>
            {score.suggestions && Array.isArray(score.suggestions) && score.suggestions.length > 0 && (
              <div className="border border-border rounded-xl bg-card p-6">
                <h3 className="font-semibold mb-3">Improvement Suggestions</h3>
                <ul className="space-y-2">{score.suggestions.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />{s}</li>
                ))}</ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No score yet. Click "Score Ad" to analyze this ad's quality.</p>
          </div>
        )
      )}

      {tab === 'variations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {styles.map(s => {
              const exists = variations.some(v => v.style === s.value);
              return (
                <button key={s.value} onClick={() => handleVariation(s.value)} disabled={!!generatingVar || exists}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${exists ? 'bg-muted text-muted-foreground cursor-default' : 'border border-border hover:bg-primary/10 hover:border-primary/30'} disabled:opacity-50 flex items-center gap-2`}>
                  {generatingVar === s.value && <Loader2 className="h-3 w-3 animate-spin" />}
                  {exists ? `${s.label} ✓` : `Generate ${s.label}`}
                </button>
              );
            })}
          </div>
          {variations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><p>No variations yet. Generate different versions of this ad above.</p></div>
          ) : (
            <div className="space-y-4">{variations.map((v, i) => (
              <div key={v.id || i} className="border border-border rounded-xl bg-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">{v.style.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Version</h4>
                  {v.tokensUsed && <span className="text-xs text-muted-foreground">{v.tokensUsed} tokens</span>}
                </div>
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[400px] text-muted-foreground">{JSON.stringify(v.output, null, 2)}</pre>
              </div>
            ))}</div>
          )}
        </div>
      )}
    </div>
  );
}
