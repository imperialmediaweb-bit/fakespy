import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generationsApi } from '@/api/generations';
import { adScoreApi, variationsApi } from '@/api/newModules';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, InlineAlert, TabBar, btnPrimary, btnSecondary } from '@/components/shared';
import { AdOutput } from '@/components/shared/AdOutput';
import { Loader2, Star, Zap, Layers } from 'lucide-react';
import type { AdGeneration, AdScore, AdVariation, VariationStyle, VariationStyleInfo } from '@/types/api';
import { formatDateTime } from '@/lib/utils';

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium tabular-nums">{value}/100</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

type Tab = 'output' | 'score' | 'variations';

export default function GenerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [gen, setGen] = useState<AdGeneration | null>(null);
  const [score, setScore] = useState<AdScore | null>(null);
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [styles, setStyles] = useState<VariationStyleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [scoring, setScoring] = useState(false);
  const [generatingVar, setGeneratingVar] = useState<VariationStyle | 'all' | ''>('');
  const [actionError, setActionError] = useState('');
  const [tab, setTab] = useState<Tab>('output');

  const load = () => {
    if (!id) return;
    setLoading(true); setLoadError('');
    Promise.all([
      generationsApi.get(id),
      adScoreApi.get(id).catch(() => null),
      variationsApi.list(id).catch(() => null),
      variationsApi.getStyles().catch(() => null),
    ]).then(([g, s, v, st]) => {
      setGen(g.data.data);
      setScore(s?.data.data ?? null);
      setVariations(v?.data.data ?? []);
      setStyles(st?.data.data ?? []);
    }).catch(err => setLoadError(getApiErrorMessage(err, 'Could not load generation')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleScore = async () => {
    if (!id) return;
    setScoring(true); setActionError('');
    try { const { data } = await adScoreApi.score(id); setScore(data.data); setTab('score'); }
    catch (err) { setActionError(getApiErrorMessage(err, 'Scoring failed')); }
    finally { setScoring(false); }
  };

  const handleVariation = async (style: VariationStyle) => {
    if (!id) return;
    setGeneratingVar(style); setActionError('');
    try { const { data } = await variationsApi.generate({ generationId: id, style }); setVariations(v => [data.data, ...v]); setTab('variations'); }
    catch (err) { setActionError(getApiErrorMessage(err, 'Could not generate variation')); }
    finally { setGeneratingVar(''); }
  };

  const handleGenerateAll = async () => {
    if (!id) return;
    setGeneratingVar('all'); setActionError('');
    try { const { data } = await variationsApi.generateAll(id); setVariations(data.data); setTab('variations'); }
    catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not generate all variations'));
      // Some styles may have completed before a quota error — refresh the list.
      variationsApi.list(id).then(r => setVariations(r.data.data)).catch(() => undefined);
    } finally { setGeneratingVar(''); }
  };

  if (loading) return <LoadingSpinner />;
  if (loadError || !gen) return <ErrorState message={loadError || 'Generation not found'} onRetry={load} />;

  const missingStyles = styles.filter(s => !variations.some(v => v.style === s.value));
  const tabs: { key: Tab; label: string }[] = [
    { key: 'output', label: 'Generated Ad' },
    { key: 'score', label: `Ad Score${score ? ` · ${score.overallScore}/100` : ''}` },
    { key: 'variations', label: `Variations (${variations.length})` },
  ];

  return (
    <div>
      <PageHeader title={gen.type.replace(/_/g, ' ')} description={`${gen.project?.title ? `${gen.project.title} · ` : ''}${gen.project?.brandName || ''} · ${formatDateTime(gen.createdAt)}`} actions={
        <>
          {gen.project && <Link to={`/dashboard/projects/${gen.projectId}`} className={`${btnSecondary} px-4 py-2 text-sm`}>Back to project</Link>}
          {!score && <button type="button" onClick={handleScore} disabled={scoring} className={`${btnPrimary} px-4 py-2 text-sm`}>
            {scoring ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Star className="h-4 w-4" aria-hidden="true" />} Score Ad
          </button>}
        </>
      } />

      {actionError && <div className="mb-4"><InlineAlert onDismiss={() => setActionError('')}>{actionError}</InlineAlert></div>}

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {tab === 'output' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><AdOutput type={gen.type} output={gen.output} /></div>
          <div className="border border-border rounded-xl bg-card p-6 h-fit">
            <h2 className="font-semibold mb-3">Brief</h2>
            <dl className="text-sm space-y-2 text-muted-foreground">
              {gen.tone && <div><dt className="text-xs uppercase tracking-wide">Tone</dt><dd className="text-foreground">{gen.tone}</dd></div>}
              {gen.audience && <div><dt className="text-xs uppercase tracking-wide">Audience</dt><dd className="text-foreground">{gen.audience}</dd></div>}
              {gen.objective && <div><dt className="text-xs uppercase tracking-wide">Objective</dt><dd className="text-foreground">{gen.objective}</dd></div>}
              {gen.tokensUsed != null && <div><dt className="text-xs uppercase tracking-wide">Tokens</dt><dd className="text-foreground tabular-nums">{gen.tokensUsed}</dd></div>}
              {gen.estimatedCost != null && <div><dt className="text-xs uppercase tracking-wide">Est. AI cost</dt><dd className="text-foreground tabular-nums">${gen.estimatedCost.toFixed(4)}</dd></div>}
            </dl>
          </div>
        </div>
      )}

      {tab === 'score' && (
        score ? (
          <div className="max-w-2xl space-y-6">
            <div className="border border-border rounded-xl bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Ad Quality Score</h2>
                <span className={`text-2xl font-bold tabular-nums ${score.overallScore >= 75 ? 'text-green-400' : score.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{score.overallScore}/100</span>
              </div>
              <ScoreBar label="Clarity" value={score.clarityScore} />
              <ScoreBar label="Emotional Impact" value={score.emotionalImpact} />
              <ScoreBar label="CTR Potential" value={score.ctrPotential} />
              <ScoreBar label="Conversion Strength" value={score.conversionStrength} />
            </div>
            {Array.isArray(score.suggestions) && score.suggestions.length > 0 && (
              <div className="border border-border rounded-xl bg-card p-6">
                <h2 className="font-semibold mb-3">Improvement Suggestions</h2>
                <ul className="space-y-2">{score.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />{s}</li>
                ))}</ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-3 opacity-50" aria-hidden="true" />
            <p>No score yet. Scoring uses 1 generation credit.</p>
            <button type="button" onClick={handleScore} disabled={scoring} className={`${btnPrimary} px-4 py-2 text-sm mt-4`}>
              {scoring ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Star className="h-4 w-4" aria-hidden="true" />} Score this ad
            </button>
          </div>
        )
      )}

      {tab === 'variations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {styles.map(s => {
              const exists = variations.some(v => v.style === s.value);
              return (
                <button key={s.value} type="button" onClick={() => handleVariation(s.value)} disabled={!!generatingVar || exists} title={s.description}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${exists ? 'bg-muted text-muted-foreground cursor-default' : 'border border-border hover:bg-primary/10 hover:border-primary/30'} disabled:opacity-60`}>
                  {generatingVar === s.value && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                  {exists ? `${s.label} ✓` : s.label}
                </button>
              );
            })}
            {missingStyles.length > 1 && (
              <button type="button" onClick={handleGenerateAll} disabled={!!generatingVar} className={`${btnPrimary} px-4 py-2 text-sm ml-auto`}>
                {generatingVar === 'all' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Layers className="h-4 w-4" aria-hidden="true" />}
                Generate all remaining ({missingStyles.length} credits)
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Each variation uses 1 generation credit.</p>
          {variations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><p>No variations yet. Pick a style above to rewrite this ad.</p></div>
          ) : (
            <div className="space-y-6">{variations.map(v => (
              <section key={v.id} aria-labelledby={`var-${v.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 id={`var-${v.id}`} className="font-semibold text-sm">{styles.find(s => s.value === v.style)?.label || v.style.replace(/_/g, ' ')} version</h2>
                  {v.tokensUsed != null && <span className="text-xs text-muted-foreground tabular-nums">{v.tokensUsed} tokens</span>}
                </div>
                <AdOutput type={gen.type} output={v.output} />
              </section>
            ))}</div>
          )}
        </div>
      )}
    </div>
  );
}
