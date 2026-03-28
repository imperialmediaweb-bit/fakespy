import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { PageHeader } from '@/components/shared';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', brandName: '', niche: '', location: '', targetAudience: '', productDescription: '', competitors: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const competitors = form.competitors ? form.competitors.split(',').map(s => s.trim()).filter(Boolean) : [];
      const { data } = await projectsApi.create({ title: form.title, brandName: form.brandName, niche: form.niche || undefined, location: form.location || undefined, targetAudience: form.targetAudience || undefined, productDescription: form.productDescription || undefined, competitors: competitors.length ? competitors : undefined });
      navigate(`/dashboard/projects/${data.data.id}`);
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to create project'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div>
      <PageHeader title="Create Project" description="Set up a new brand analysis project." />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1.5">Project Title *</label><input required value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} placeholder="Q2 Campaign Research" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Brand Name *</label><input required value={form.brandName} onChange={e => set('brandName', e.target.value)} className={inputClass} placeholder="Your Brand" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1.5">Niche / Industry</label><input value={form.niche} onChange={e => set('niche', e.target.value)} className={inputClass} placeholder="E-commerce, SaaS, Health..." /></div>
          <div><label className="block text-sm font-medium mb-1.5">Location / Market</label><input value={form.location} onChange={e => set('location', e.target.value)} className={inputClass} placeholder="US, Europe, Global..." /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1.5">Target Audience</label><input value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)} className={inputClass} placeholder="Small business owners aged 25-45..." /></div>
        <div><label className="block text-sm font-medium mb-1.5">Product / Service Description</label><textarea value={form.productDescription} onChange={e => set('productDescription', e.target.value)} rows={3} className={inputClass + ' resize-none'} placeholder="Describe what the brand offers..." /></div>
        <div><label className="block text-sm font-medium mb-1.5">Competitors (comma-separated)</label><input value={form.competitors} onChange={e => set('competitors', e.target.value)} className={inputClass} placeholder="Competitor A, Competitor B..." /></div>
        <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Project
        </button>
      </form>
    </div>
  );
}
