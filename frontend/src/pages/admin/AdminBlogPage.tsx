import { useEffect, useState } from 'react';
import { blogApi } from '@/api/newModules';
import { PageHeader, LoadingSpinner, StatusBadge, DataTable } from '@/components/shared';
import { Plus, Loader2, Trash2, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function PostEditor({ post, categories, tags, onSave, onCancel }: { post?: any; categories: any[]; tags: any[]; onSave: (data: any) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '', content: post?.content || '', excerpt: post?.excerpt || '',
    categoryId: post?.categoryId || '', status: post?.status || 'DRAFT',
    seoTitle: post?.seoTitle || '', seoDescription: post?.seoDescription || '', seoKeywords: post?.seoKeywords || '',
    featuredImage: post?.featuredImage || '', tagIds: post?.tags?.map((t: any) => t.id) || [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await onSave({ ...form, categoryId: form.categoryId || undefined, tagIds: form.tagIds.length ? form.tagIds : undefined }); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-xl bg-card p-6">
      <div className="flex justify-between items-center"><h3 className="font-semibold">{post ? 'Edit Post' : 'New Post'}</h3><button type="button" onClick={onCancel}><X className="h-4 w-4 text-muted-foreground" /></button></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Title *</label><input required value={form.title} onChange={e => set('title', e.target.value)} className={inputClass} /></div>
        <div><label className="block text-sm font-medium mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={inputClass}>
            <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="SCHEDULED">Scheduled</option><option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Excerpt</label><input value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={inputClass} /></div>
      <div><label className="block text-sm font-medium mb-1">Content *</label><textarea required value={form.content} onChange={e => set('content', e.target.value)} rows={8} className={inputClass + ' resize-y'} /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Category</label>
          <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputClass}>
            <option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Featured Image URL</label><input value={form.featuredImage} onChange={e => set('featuredImage', e.target.value)} className={inputClass} placeholder="https://..." /></div>
      </div>
      <details className="border border-border/50 rounded-lg p-4"><summary className="text-sm font-medium cursor-pointer">SEO Fields</summary>
        <div className="space-y-3 mt-3">
          <div><label className="block text-xs text-muted-foreground mb-1">SEO Title</label><input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">SEO Description</label><input value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} className={inputClass} /></div>
          <div><label className="block text-xs text-muted-foreground mb-1">SEO Keywords</label><input value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} className={inputClass} placeholder="keyword1, keyword2..." /></div>
        </div>
      </details>
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">{tags.map(t => (
            <button key={t.id} type="button" onClick={() => set('tagIds', form.tagIds.includes(t.id) ? form.tagIds.filter((id: string) => id !== t.id) : [...form.tagIds, t.id])}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.tagIds.includes(t.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
              {t.name}
            </button>
          ))}</div>
        </div>
      )}
      <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{post ? 'Update' : 'Create'} Post</button>
    </form>
  );
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'categories' | 'tags'>('posts');
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([blogApi.getPosts(1, 50), blogApi.getCategories(), blogApi.getTags()])
      .then(([p, c, t]) => { setPosts(p.data.data.posts); setCategories(c.data.data); setTags(t.data.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSavePost = async (data: any) => {
    if (editing) { await blogApi.updatePost(editing.id, data); }
    else { await blogApi.createPost(data); }
    setEditing(null); setCreating(false); load();
  };

  const handleDeletePost = async (id: string) => { if (confirm('Delete this post?')) { await blogApi.deletePost(id); load(); } };
  const handleAddCategory = async () => { if (newCat.trim()) { await blogApi.createCategory(newCat.trim()); setNewCat(''); load(); } };
  const handleDeleteCategory = async (id: string) => { if (confirm('Delete category?')) { await blogApi.deleteCategory(id); load(); } };
  const handleAddTag = async () => { if (newTag.trim()) { await blogApi.createTag(newTag.trim()); setNewTag(''); load(); } };
  const handleDeleteTag = async (id: string) => { if (confirm('Delete tag?')) { await blogApi.deleteTag(id); load(); } };

  if (loading) return <LoadingSpinner />;

  const tabItems = [{ key: 'posts', label: `Posts (${posts.length})` }, { key: 'categories', label: `Categories (${categories.length})` }, { key: 'tags', label: `Tags (${tags.length})` }] as const;

  return (
    <div>
      <PageHeader title="Blog Management" description="Create and manage blog posts, categories, and tags." actions={
        tab === 'posts' && !creating && !editing ? <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Post</button> : undefined
      } />

      <div className="flex gap-1 mb-6 border-b border-border">
        {tabItems.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>)}
      </div>

      {tab === 'posts' && (creating || editing) && <PostEditor post={editing} categories={categories} tags={tags} onSave={handleSavePost} onCancel={() => { setEditing(null); setCreating(false); }} />}

      {tab === 'posts' && !creating && !editing && (
        <DataTable columns={[
          { key: 'title', header: 'Title', render: (r: any) => <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground font-mono">/{r.slug}</p></div> },
          { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'category', header: 'Category', render: (r: any) => <span className="text-sm text-muted-foreground">{r.category?.name || '—'}</span> },
          { key: 'date', header: 'Created', render: (r: any) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span> },
          { key: 'actions', header: '', render: (r: any) => <div className="flex gap-2"><button onClick={() => setEditing(r)} className="text-xs text-primary hover:underline">Edit</button><button onClick={() => handleDeletePost(r.id)} className="text-xs text-destructive hover:underline">Delete</button></div> },
        ]} data={posts} emptyTitle="No blog posts" emptyDescription="Create your first blog post." />
      )}

      {tab === 'categories' && (
        <div className="max-w-lg space-y-4">
          <div className="flex gap-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button onClick={handleAddCategory} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">Add</button>
          </div>
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug} · {c._count?.posts || 0} posts</p></div>
              <button onClick={() => handleDeleteCategory(c.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {tab === 'tags' && (
        <div className="max-w-lg space-y-4">
          <div className="flex gap-2">
            <input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="New tag name" className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button onClick={handleAddTag} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">{tags.map(t => (
            <span key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-full text-sm">
              {t.name} <span className="text-xs text-muted-foreground">({t._count?.posts || 0})</span>
              <button onClick={() => handleDeleteTag(t.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}</div>
        </div>
      )}
    </div>
  );
}
