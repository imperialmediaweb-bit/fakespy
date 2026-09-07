import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { generationsApi } from '@/api/generations';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2, Sparkles } from 'lucide-react';
import type { Project, GenerationType } from '@/types/api';

const TYPES: { value: GenerationType; label: string; hint: string }[] = [
  { value: 'FACEBOOK_AD', label: 'Facebook Ad', hint: '3 variations: headline, primary text, description, CTA' },
  { value: 'GOOGLE_AD', label: 'Google Search Ad', hint: '3 ads: headlines, descriptions, sitelinks' },
  { value: 'VIDEO_SCRIPT', label: 'Video Script', hint: 'Timestamped visual + audio script with hook and CTA' },
  { value: 'HOOK', label: 'Hooks', hint: '10 scroll-stopping opening lines' },
  { value: 'CTA', label: 'CTAs', hint: '10 calls to action with urgency levels' },
  { value: 'FULL_CAMPAIGN', label: 'Full Campaign', hint: 'Complete multi-platform brief' },
];

export default function GenerateAdsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState<GenerationType>('FACEBOOK_AD');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [extra, setExtra] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = () => {
    if (!id) return;
    setLoading(true); setLoadError('');
    projectsApi.get(id)
      .then(r => { setProject(r.data.data); setAudience(r.data.data.targetAudience || ''); })
      .catch(err => setLoadError(getApiErrorMessage(err, 'Could not load project')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!project) return;
    setError(''); setFieldErrors({}); setGenerating(true);
    try {
      const { data } = await generationsApi.create({ projectId: project.id, type, brandName: project.brandName, niche: project.niche || undefined, audience: audience || undefined, tone: tone || undefined, objective: objective || undefined, additionalInstructions: extra || undefined });
      // Persisted result has its own URL so it survives refresh and is in history.
      navigate(`/dashboard/generations/${data.data.id}`);
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Generation failed'));
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading project..." />;
  if (loadError || !project) return <ErrorState message={loadError || 'Project not found'} onRetry={load} />;

  const selected = TYPES.find(t => t.value === type)!;

  return (
    <div>
      <PageHeader title="Generate Ads" description={`For ${project.title} · ${project.brandName}`} actions={<Link to={`/dashboard/projects/${project.id}`} className="text-sm text-primary hover:underline">Back to project</Link>} />
      <form onSubmit={handleGenerate} className="max-w-2xl space-y-5" noValidate>
        {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
        <div>
          <label htmlFor="gen-type" className="block text-sm font-medium mb-1.5">Ad type</label>
          <select id="gen-type" value={type} onChange={e => setType(e.target.value as GenerationType)} className={inputClass}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-muted-foreground mt-1">{selected.hint}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gen-tone" className="block text-sm font-medium mb-1.5">Tone</label>
            <input id="gen-tone" value={tone} onChange={e => setTone(e.target.value)} className={inputClass} placeholder="professional, casual, bold..." maxLength={100} aria-invalid={!!fieldErrors.tone} />
            {fieldErrors.tone && <p className="text-xs text-destructive mt-1">{fieldErrors.tone}</p>}
          </div>
          <div>
            <label htmlFor="gen-objective" className="block text-sm font-medium mb-1.5">Objective</label>
            <input id="gen-objective" value={objective} onChange={e => setObjective(e.target.value)} className={inputClass} placeholder="Lead gen, awareness, sales..." maxLength={500} aria-invalid={!!fieldErrors.objective} />
            {fieldErrors.objective && <p className="text-xs text-destructive mt-1">{fieldErrors.objective}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="gen-audience" className="block text-sm font-medium mb-1.5">Target audience</label>
          <input id="gen-audience" value={audience} onChange={e => setAudience(e.target.value)} className={inputClass} maxLength={500} aria-invalid={!!fieldErrors.audience} />
          {fieldErrors.audience && <p className="text-xs text-destructive mt-1">{fieldErrors.audience}</p>}
        </div>
        <div>
          <label htmlFor="gen-extra" className="block text-sm font-medium mb-1.5">Additional instructions</label>
          <textarea id="gen-extra" value={extra} onChange={e => setExtra(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Any specific requirements, offers, or things to avoid..." maxLength={2000} aria-invalid={!!fieldErrors.additionalInstructions} />
          {fieldErrors.additionalInstructions && <p className="text-xs text-destructive mt-1">{fieldErrors.additionalInstructions}</p>}
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={generating} className={`${btnPrimary} px-6 py-2.5`}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            {generating ? 'Generating with AI…' : 'Generate'}
          </button>
          <span className="text-xs text-muted-foreground">Uses 1 generation from your monthly quota.</span>
        </div>
      </form>
    </div>
  );
}
