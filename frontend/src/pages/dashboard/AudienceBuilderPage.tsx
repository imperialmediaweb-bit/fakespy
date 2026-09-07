import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { audienceApi } from '@/api/newModules';
import { projectsApi } from '@/api/projects';
import { getApiErrorMessage } from '@/api/client';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState, InlineAlert, inputClass, btnPrimary, btnSecondary } from '@/components/shared';
import { CopyButton } from '@/components/shared/AdOutput';
import { Users, Plus, Loader2, Trash2 } from 'lucide-react';
import type { Project, AudienceProfile } from '@/types/api';

function ListSection({ title, items }: { title: string; items: unknown }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const text = items.map(String).join('\n');
  return (
    <section aria-labelledby={`aud-${title}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 id={`aud-${title}`} className="text-sm font-semibold">{title}</h3>
        <CopyButton text={text} />
      </div>
      <ul className="space-y-1 list-none p-0 m-0">{items.map((item, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5" aria-hidden="true">•</span>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul>
    </section>
  );
}

function KeyValueSection({ title, data }: { title: string; data: unknown }) {
  if (!data || typeof data !== 'object' || Object.keys(data as object).length === 0) return null;
  const entries = Object.entries(data as Record<string, unknown>);
  return (
    <section aria-labelledby={`aud-${title}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 id={`aud-${title}`} className="text-sm font-semibold">{title}</h3>
        <CopyButton text={entries.map(([k, v]) => `${k}: ${String(v)}`).join('\n')} />
      </div>
      <dl className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
        {entries.map(([k, v]) => <div key={k}><dt className="inline text-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}: </dt><dd className="inline">{String(v)}</dd></div>)}
      </dl>
    </section>
  );
}

export default function AudienceBuilderPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [profiles, setProfiles] = useState<AudienceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<AudienceProfile | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    if (!projectId) return;
    setLoading(true); setLoadError('');
    Promise.all([projectsApi.get(projectId), audienceApi.listByProject(projectId)])
      .then(([p, a]) => { setProject(p.data.data); setProfiles(a.data.data); setSelected(prev => prev ?? a.data.data[0] ?? null); })
      .catch(err => setLoadError(getApiErrorMessage(err, 'Could not load project')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [projectId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;
    setGenerating(true); setError('');
    try {
      const { data } = await audienceApi.generate({ projectId, name: name.trim() });
      setProfiles(prev => [data.data, ...prev]);
      setSelected(data.data);
      setName('');
    } catch (err) { setError(getApiErrorMessage(err, 'Could not generate profile')); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (profile: AudienceProfile) => {
    if (!window.confirm(`Delete the "${profile.name}" profile? This cannot be undone.`)) return;
    setDeletingId(profile.id); setError('');
    try {
      await audienceApi.delete(profile.id);
      setProfiles(prev => prev.filter(p => p.id !== profile.id));
      if (selected?.id === profile.id) setSelected(null);
    } catch (err) { setError(getApiErrorMessage(err, 'Could not delete profile')); }
    finally { setDeletingId(''); }
  };

  if (loading) return <LoadingSpinner />;
  if (loadError || !project) return <ErrorState message={loadError || 'Project not found'} onRetry={load} />;

  return (
    <div>
      <PageHeader title="Audience Builder" description={`${project.brandName} — ideal customer profiles for ad targeting`} actions={<Link to={`/dashboard/projects/${project.id}`} className={`${btnSecondary} px-4 py-2 text-sm`}>Back to project</Link>} />

      <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 mb-2">
        <label htmlFor="aud-name" className="sr-only">Profile name</label>
        <input id="aud-name" value={name} onChange={e => setName(e.target.value)} maxLength={200} placeholder="Profile name (e.g. Primary Buyer, Budget Shopper...)" className={`${inputClass} flex-1`} />
        <button type="submit" disabled={generating || !name.trim()} className={`${btnPrimary} px-5 py-2.5 text-sm`}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />} Generate Profile
        </button>
      </form>
      <p className="text-xs text-muted-foreground mb-6">Uses 1 generation credit per profile.</p>
      {error && <div className="mb-4"><InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert></div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Saved Profiles ({profiles.length})</h2>
          {profiles.length === 0 ? <EmptyState icon={Users} title="No profiles yet" description="Generate your first audience profile above." /> : (
            <ul className="space-y-2 list-none p-0 m-0" role="listbox" aria-label="Audience profiles">
              {profiles.map(p => {
                const active = selected?.id === p.id;
                return (
                  <li key={p.id} className={`flex items-center gap-2 rounded-lg border transition-colors ${active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                    <button type="button" role="option" aria-selected={active} onClick={() => setSelected(p)} className="flex-1 text-left p-3 text-sm font-medium truncate">{p.name}</button>
                    <button type="button" onClick={() => handleDelete(p)} disabled={deletingId === p.id} aria-label={`Delete ${p.name}`} className="p-3 text-muted-foreground hover:text-destructive disabled:opacity-50">
                      {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <article className="border border-border rounded-xl bg-card p-6 space-y-6">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <KeyValueSection title="Ideal Customer Avatar" data={selected.avatar} />
              <ListSection title="Pain Points" items={selected.painPoints} />
              <ListSection title="Desires" items={selected.desires} />
              <ListSection title="Objections" items={selected.objections} />
              <ListSection title="Buying Triggers" items={selected.buyingTriggers} />
              <KeyValueSection title="Demographics" data={selected.demographics} />
              <ListSection title="Targeting Interests" items={selected.interests} />
            </article>
          ) : (
            <div className="border border-border rounded-xl bg-card p-12 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-3 opacity-50" aria-hidden="true" />
              <p>Select a profile to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
