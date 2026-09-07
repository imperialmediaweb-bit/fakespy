import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/api/projects';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { PageHeader, InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2 } from 'lucide-react';

const FIELDS = {
  title: { label: 'Project title', placeholder: 'Q2 Campaign Research', required: true, max: 200 },
  brandName: { label: 'Brand name', placeholder: 'Your Brand', required: true, max: 200 },
  niche: { label: 'Niche / industry', placeholder: 'E-commerce, SaaS, Health...', required: false, max: 200 },
  location: { label: 'Location / market', placeholder: 'US, Europe, Global...', required: false, max: 200 },
  targetAudience: { label: 'Target audience', placeholder: 'Small business owners aged 25-45...', required: false, max: 500 },
} as const;

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', brandName: '', niche: '', location: '', targetAudience: '', productDescription: '', competitors: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFieldErrors({}); setLoading(true);
    try {
      const competitors = form.competitors ? form.competitors.split(',').map(s => s.trim()).filter(Boolean) : [];
      const { data } = await projectsApi.create({ title: form.title, brandName: form.brandName, niche: form.niche || undefined, location: form.location || undefined, targetAudience: form.targetAudience || undefined, productDescription: form.productDescription || undefined, competitors: competitors.length ? competitors : undefined });
      navigate(`/dashboard/projects/${data.data.id}`);
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to create project'));
      setLoading(false);
    }
  };

  const field = (k: keyof typeof FIELDS) => {
    const f = FIELDS[k];
    return (
      <div key={k}>
        <label htmlFor={`np-${k}`} className="block text-sm font-medium mb-1.5">{f.label}{f.required && <span className="text-destructive" aria-hidden="true"> *</span>}</label>
        <input id={`np-${k}`} required={f.required} maxLength={f.max} value={form[k]} onChange={e => set(k, e.target.value)} className={inputClass} placeholder={f.placeholder} aria-invalid={!!fieldErrors[k]} />
        {fieldErrors[k] && <p className="text-xs text-destructive mt-1">{fieldErrors[k]}</p>}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Create Project" description="Set up a new brand analysis project." />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5" noValidate>
        {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
        <div className="grid sm:grid-cols-2 gap-4">{field('title')}{field('brandName')}</div>
        <div className="grid sm:grid-cols-2 gap-4">{field('niche')}{field('location')}</div>
        {field('targetAudience')}
        <div>
          <label htmlFor="np-productDescription" className="block text-sm font-medium mb-1.5">Product / service description</label>
          <textarea id="np-productDescription" value={form.productDescription} onChange={e => set('productDescription', e.target.value)} rows={3} maxLength={2000} className={`${inputClass} resize-none`} placeholder="Describe what the brand offers..." aria-invalid={!!fieldErrors.productDescription} />
          {fieldErrors.productDescription && <p className="text-xs text-destructive mt-1">{fieldErrors.productDescription}</p>}
        </div>
        <div>
          <label htmlFor="np-competitors" className="block text-sm font-medium mb-1.5">Competitors <span className="text-muted-foreground font-normal">(comma-separated, up to 20)</span></label>
          <input id="np-competitors" value={form.competitors} onChange={e => set('competitors', e.target.value)} className={inputClass} placeholder="Competitor A, Competitor B..." aria-invalid={!!fieldErrors.competitors} />
          {fieldErrors.competitors && <p className="text-xs text-destructive mt-1">{fieldErrors.competitors}</p>}
        </div>
        <button type="submit" disabled={loading} className={`${btnPrimary} px-6 py-2.5`}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Create Project
        </button>
      </form>
    </div>
  );
}
