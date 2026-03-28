import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { audienceApi } from '@/api/newModules';
import { projectsApi } from '@/api/projects';
import { PageHeader, LoadingSpinner, EmptyState, ErrorState } from '@/components/shared';
import { Users, Plus, Loader2, Trash2 } from 'lucide-react';
import type { Project } from '@/types/api';

export default function AudienceBuilderPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState('');

  const load = () => {
    if (!projectId) return;
    Promise.all([projectsApi.get(projectId), audienceApi.listByProject(projectId)])
      .then(([p, a]) => { setProject(p.data.data); setProfiles(a.data.data); })
      .catch(e => setError(e.response?.data?.error?.message || 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [projectId]);

  const handleGenerate = async () => {
    if (!name.trim() || !projectId) return;
    setGenerating(true); setError('');
    try {
      const { data } = await audienceApi.generate({ projectId, name: name.trim() });
      setProfiles([data.data, ...profiles]);
      setSelected(data.data);
      setName('');
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed'); }
    finally { setGenerating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this audience profile?')) return;
    await audienceApi.delete(id);
    setProfiles(profiles.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) return <LoadingSpinner />;
  if (error && !project) return <ErrorState message={error} onRetry={load} />;

  const renderList = (title: string, items: any[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    return (
      <div>
        <h4 className="text-sm font-semibold mb-2">{title}</h4>
        <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Audience Builder" description={`${project?.brandName} — Generate ideal customer profiles for ad targeting`} />

      <div className="flex gap-3 mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Profile name (e.g. Primary Buyer, Budget Shopper...)" className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        <button onClick={handleGenerate} disabled={generating || !name.trim()} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Generate Profile
        </button>
      </div>
      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Saved Profiles ({profiles.length})</h3>
          {profiles.length === 0 ? <EmptyState icon={Users} title="No profiles yet" description="Generate your first audience profile above." /> : profiles.map(p => (
            <div key={p.id} onClick={() => setSelected(p)} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{p.name}</p>
                <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="border border-border rounded-xl bg-card p-6 space-y-6">
              <h3 className="text-lg font-semibold">{selected.name}</h3>
              {selected.avatar && typeof selected.avatar === 'object' && Object.keys(selected.avatar).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Ideal Customer Avatar</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {Object.entries(selected.avatar).map(([k, v]) => <div key={k}><strong className="text-foreground">{k}:</strong> {String(v)}</div>)}
                  </div>
                </div>
              )}
              {renderList('Pain Points', selected.painPoints)}
              {renderList('Desires', selected.desires)}
              {renderList('Objections', selected.objections)}
              {renderList('Buying Triggers', selected.buyingTriggers)}
              {selected.demographics && typeof selected.demographics === 'object' && Object.keys(selected.demographics).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Demographics</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {Object.entries(selected.demographics).map(([k, v]) => <div key={k}><strong className="text-foreground">{k}:</strong> {String(v)}</div>)}
                  </div>
                </div>
              )}
              {renderList('Targeting Interests', selected.interests)}
            </div>
          ) : (
            <div className="border border-border rounded-xl bg-card p-12 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Select a profile to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
