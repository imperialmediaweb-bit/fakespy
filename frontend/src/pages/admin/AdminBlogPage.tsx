import { useEffect, useState } from 'react';
import { blogApi, type BlogPostInput } from '@/api/newModules';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { PageHeader, LoadingSpinner, ErrorState, StatusBadge, DataTable, InlineAlert, TabBar, inputClass, btnPrimary, btnSecondary } from '@/components/shared';
import { Plus, Loader2, Trash2, X, ExternalLink } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { BlogCategory, BlogPost, BlogPostStatus, BlogTag } from '@/types/api';

const STATUSES: BlogPostStatus[] = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'];

function PostEditor({ post, categories, tags, onSave, onCancel }: { post?: BlogPost | null; categories: BlogCategory[]; tags: BlogTag[]; onSave: (data: BlogPostInput) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '', content: post?.content || '', excerpt: post?.excerpt || '',
    categoryId: post?.categoryId || '', status: (post?.status || 'DRAFT') as BlogPostStatus,
    seoTitle: post?.seoTitle || '', seoDescription: post?.seoDescription || '', seoKeywords: post?.seoKeywords || '',
    featuredImage: post?.featuredImage || '', tagIds: post?.tags?.map(t => t.id) || [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setFieldErrors({});
    try {
      await onSave({
        title: form.title, content: form.content, status: form.status,
        excerpt: form.excerpt || undefined, categoryId: form.categoryId || undefined,
        featuredImage: form.featuredImage || undefined, seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined, seoKeywords: form.seoKeywords || undefined,
        tagIds: form.tagIds,
      });
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Could not save post'));
    } finally { setSaving(false); }
  };

  const err = (k: string) => fieldErrors[k] ? <p className="text-xs text-destructive mt-1">{fieldErrors[k]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-card p-6" noValidate>
      <div className="flex justify-between items-center"><h2 className="font-semibold">{post ? 'Edit Post' : 'New Post'}</h2><button type="button" onClick={onCancel} aria-label="Close editor"><X className="h-4 w-4 text-muted-foreground" aria-hidden="true" /></button></div>
      {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label htmlFor="bp-title" className="block text-sm font-medium mb-1">Title *</label><input id="bp-title" required maxLength={300} value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} aria-invalid={!!fieldErrors.title} />{err('title')}</div>
        <div><label htmlFor="bp-status" className="block text-sm font-medium mb-1">Status</label>
          <select id="bp-status" value={form.status} onChange={e => set('status', e.target.value as BlogPostStatus)} className={inputClass}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>
      <div><label htmlFor="bp-excerpt" className="block text-sm font-medium mb-1">Excerpt <span className="text-muted-foreground font-normal">(shown in listings and as the default meta description)</span></label><input id="bp-excerpt" maxLength={500} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={inputClass} aria-invalid={!!fieldErrors.excerpt} />{err('excerpt')}</div>
      <div><label htmlFor="bp-content" className="block text-sm font-medium mb-1">Content * <span className="text-muted-foreground font-normal">(supports ## headings, ### subheadings and - bullet lists)</span></label><textarea id="bp-content" required value={form.content} onChange={e => set('content', e.target.value)} rows={12} className={`${inputClass} resize-y font-mono text-xs`} aria-invalid={!!fieldErrors.content} />{err('content')}</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label htmlFor="bp-category" className="block text-sm font-medium mb-1">Category</label>
          <select id="bp-category" value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputClass}>
            <option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label htmlFor="bp-image" className="block text-sm font-medium mb-1">Featured image URL</label><input id="bp-image" type="url" maxLength={500} value={form.featuredImage} onChange={e => set('featuredImage', e.target.value)} className={inputClass} placeholder="https://..." aria-invalid={!!fieldErrors.featuredImage} />{err('featuredImage')}</div>
      </div>
      <details className="border border-border/50 rounded-lg p-4"><summary className="text-sm font-medium cursor-pointer">SEO fields</summary>
        <div className="space-y-3 mt-3">
          <div><label htmlFor="bp-seo-title" className="block text-xs text-muted-foreground mb-1">SEO title (defaults to the post title)</label><input id="bp-seo-title" maxLength={200} value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="bp-seo-desc" className="block text-xs text-muted-foreground mb-1">Meta description (defaults to the excerpt)</label><input id="bp-seo-desc" maxLength={500} value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="bp-seo-kw" className="block text-xs text-muted-foreground mb-1">Keywords</label><input id="bp-seo-kw" maxLength={300} value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} className={inputClass} placeholder="keyword1, keyword2..." /></div>
        </div>
      </details>
      {tags.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium mb-2">Tags</legend>
          <div className="flex flex-wrap gap-2">{tags.map(t => {
            const on = form.tagIds.includes(t.id);
            return (
              <button key={t.id} type="button" aria-pressed={on} onClick={() => set('tagIds', on ? form.tagIds.filter(id => id !== t.id) : [...form.tagIds, t.id])}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${on ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                {t.name}
              </button>
            );
          })}</div>
        </fieldset>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={`${btnPrimary} px-6 py-2 text-sm`}>{saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{post ? 'Update' : 'Create'} post</button>
        <button type="button" onClick={onCancel} className={`${btnSecondary} px-4 py-2 text-sm`}>Cancel</button>
      </div>
    </form>
  );
}

type Tab = 'posts' | 'categories' | 'tags';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<Tab>('posts');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    setLoading(true); setLoadError('');
    Promise.all([blogApi.getPosts(1, 50), blogApi.getCategories(), blogApi.getTags()])
      .then(([p, c, t]) => { setPosts(p.data.data.posts); setCategories(c.data.data); setTags(t.data.data); })
      .catch(err => setLoadError(getApiErrorMessage(err, 'Could not load blog data')))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const run = async (id: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusyId(id); setError(''); setMessage('');
    try { await fn(); setMessage(okMsg); load(); }
    catch (err) { setError(getApiErrorMessage(err, 'Action failed')); }
    finally { setBusyId(''); }
  };

  const handleSavePost = async (data: BlogPostInput) => {
    // Errors propagate to the editor, which renders them inline.
    if (editing) await blogApi.updatePost(editing.id, data); else await blogApi.createPost(data);
    setEditing(null); setCreating(false); setMessage(editing ? 'Post updated.' : 'Post created.'); load();
  };

  if (loading) return <LoadingSpinner />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  const tabs: { key: Tab; label: string }[] = [{ key: 'posts', label: `Posts (${posts.length})` }, { key: 'categories', label: `Categories (${categories.length})` }, { key: 'tags', label: `Tags (${tags.length})` }];
  const showEditor = tab === 'posts' && (creating || editing);

  return (
    <div>
      <PageHeader title="Blog Management" description="Create and manage blog posts, categories, and tags. Published posts appear at /blog with SEO-friendly URLs." actions={
        !showEditor ? <button type="button" onClick={() => { setTab('posts'); setCreating(true); setEditing(null); }} className={`${btnPrimary} px-4 py-2 text-sm`}><Plus className="h-4 w-4" aria-hidden="true" /> New Post</button> : undefined
      } />
      {message && <div className="mb-4"><InlineAlert kind="success" onDismiss={() => setMessage('')}>{message}</InlineAlert></div>}
      {error && <div className="mb-4"><InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert></div>}

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {showEditor && <PostEditor post={editing} categories={categories} tags={tags} onSave={handleSavePost} onCancel={() => { setEditing(null); setCreating(false); }} />}

      {tab === 'posts' && !showEditor && (
        <DataTable columns={[
          { key: 'title', header: 'Title', render: (r: BlogPost) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground font-mono">/blog/{r.slug}</p></div> },
          { key: 'status', header: 'Status', render: (r: BlogPost) => <StatusBadge status={r.status} /> },
          { key: 'category', header: 'Category', render: (r: BlogPost) => <span className="text-sm text-muted-foreground">{r.category?.name || '—'}</span> },
          { key: 'date', header: 'Updated', render: (r: BlogPost) => <span className="text-sm text-muted-foreground">{formatDateTime(r.updatedAt)}</span> },
          { key: 'actions', header: '', render: (r: BlogPost) => (
            <div className="flex gap-3 items-center">
              {r.status === 'PUBLISHED' && <a href={`/blog/${r.slug}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1" aria-label={`View ${r.title}`}>View <ExternalLink className="h-3 w-3" aria-hidden="true" /></a>}
              <button type="button" onClick={() => { setEditing(r); setCreating(false); }} className="text-xs text-primary hover:underline">Edit</button>
              <button type="button" disabled={busyId === r.id} onClick={() => { if (window.confirm(`Delete "${r.title}"? This cannot be undone.`)) run(r.id, () => blogApi.deletePost(r.id), 'Post deleted.'); }} className="text-xs text-destructive hover:underline disabled:opacity-50">Delete</button>
            </div>
          ) },
        ]} data={posts} emptyTitle="No blog posts" emptyDescription="Create your first post to start publishing." />
      )}

      {tab === 'categories' && (
        <div className="max-w-lg space-y-4">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (newCat.trim()) run('cat', () => blogApi.createCategory(newCat.trim()).then(() => setNewCat('')), 'Category added.'); }}>
            <label htmlFor="new-cat" className="sr-only">New category name</label>
            <input id="new-cat" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" className={`${inputClass} flex-1`} />
            <button type="submit" disabled={busyId === 'cat' || !newCat.trim()} className={`${btnPrimary} px-4 py-2 text-sm`}>Add</button>
          </form>
          <ul className="space-y-2 list-none p-0 m-0">{categories.map(c => (
            <li key={c.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug} · {c._count?.posts || 0} posts</p></div>
              <button type="button" disabled={busyId === c.id} onClick={() => { if (window.confirm(`Delete category "${c.name}"? Posts keep their content but lose the category.`)) run(c.id, () => blogApi.deleteCategory(c.id), 'Category deleted.'); }} aria-label={`Delete ${c.name}`} className="text-destructive hover:text-destructive/80 disabled:opacity-50"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
            </li>
          ))}</ul>
        </div>
      )}

      {tab === 'tags' && (
        <div className="max-w-lg space-y-4">
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (newTag.trim()) run('tag', () => blogApi.createTag(newTag.trim()).then(() => setNewTag('')), 'Tag added.'); }}>
            <label htmlFor="new-tag" className="sr-only">New tag name</label>
            <input id="new-tag" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="New tag name" className={`${inputClass} flex-1`} />
            <button type="submit" disabled={busyId === 'tag' || !newTag.trim()} className={`${btnPrimary} px-4 py-2 text-sm`}>Add</button>
          </form>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">{tags.map(t => (
            <li key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-full text-sm">
              {t.name} <span className="text-xs text-muted-foreground">({t._count?.posts || 0})</span>
              <button type="button" disabled={busyId === t.id} onClick={() => { if (window.confirm(`Delete tag "${t.name}"?`)) run(t.id, () => blogApi.deleteTag(t.id), 'Tag deleted.'); }} aria-label={`Delete ${t.name}`} className="text-muted-foreground hover:text-destructive disabled:opacity-50"><X className="h-3 w-3" aria-hidden="true" /></button>
            </li>
          ))}</ul>
        </div>
      )}
    </div>
  );
}
