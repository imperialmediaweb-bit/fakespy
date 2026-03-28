import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { generationsApi } from '@/api/generations';
import { PageHeader, LoadingSpinner } from '@/components/shared';
import { Loader2 } from 'lucide-react';
import type { Project, GenerationType } from '@/types/api';

const TYPES: { value: GenerationType; label: string }[] = [
  { value: 'FACEBOOK_AD', label: 'Facebook Ad' },
  { value: 'GOOGLE_AD', label: 'Google Ad' },
  { value: 'VIDEO_SCRIPT', label: 'Video Script' },
  { value: 'HOOK', label: 'Hooks' },
  { value: 'CTA', label: 'CTAs' },
  { value: 'FULL_CAMPAIGN', label: 'Full Campaign' },
];

export default function GenerateAdsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [type, setType] = useState<GenerationType>('FACEBOOK_AD');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [extra, setExtra] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Record<string, any> | null>(null);

  useEffect(() => { if (id) projectsApi.get(id).then(r => { setProject(r.data.data); setAudience(r.data.data.targetAudience || ''); }).finally(() => setLoading(false)); }, [id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!project) return;
    setError(''); setGenerating(true); setResult(null);
    try {
      const { data } = await generationsApi.create({ projectId: project.id, type, brandName: project.brandName, niche: project.niche || undefined, audience: audience || undefined, tone, objective: objective || undefined, additionalInstructions: extra || undefined });
      setResult(data.data.output as Record<string, any>);
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  if (loading) return <LoadingSpinner />;
  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div>
      <PageHeader title="Generate Ads" description={`For: ${project?.title}`} />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5">Ad Type</label>
            <select value={type} onChange={e => setType(e.target.value as GenerationType)} className={inputClass}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Tone</label><input value={tone} onChange={e => setTone(e.target.value)} className={inputClass} placeholder="professional, casual, bold..." /></div>
            <div><label className="block text-sm font-medium mb-1.5">Objective</label><input value={objective} onChange={e => setObjective(e.target.value)} className={inputClass} placeholder="Lead gen, awareness, sales..." /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Target Audience</label><input value={audience} onChange={e => setAudience(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Additional Instructions</label><textarea value={extra} onChange={e => setExtra(e.target.value)} rows={3} className={inputClass + ' resize-none'} placeholder="Any specific requirements..." /></div>
          <button type="submit" disabled={generating} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {generating && <Loader2 className="h-4 w-4 animate-spin" />} Generate
          </button>
        </form>
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-4">Result</h3>
          {generating && <LoadingSpinner text="Generating with AI..." />}
          {!generating && !result && <p className="text-sm text-muted-foreground">Select options and click Generate to create ad content.</p>}
          {result && <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[600px] text-muted-foreground">{JSON.stringify(result, null, 2)}</pre>}
        </div>
      </div>
    </div>
  );
}
