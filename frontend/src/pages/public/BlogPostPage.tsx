import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { blogApi } from '@/api/newModules';
import { LoadingSpinner, ErrorState } from '@/components/shared';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    blogApi.getPublishedPost(slug)
      .then(r => setPost(r.data.data))
      .catch(e => setError(e.response?.data?.error?.message || 'Article not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PublicLayout><div className="max-w-3xl mx-auto px-4 py-16"><LoadingSpinner /></div></PublicLayout>;
  if (error || !post) return <PublicLayout><div className="max-w-3xl mx-auto px-4 py-16"><ErrorState message={error || 'Article not found'} /></div></PublicLayout>;

  return (
    <PublicLayout>
      {/* SEO meta tags injected via document.title */}
      {(() => { document.title = `${post.seoTitle || post.title} — Adxura Blog`; return null; })()}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-border">
            <img src={post.featuredImage} alt={post.title} className="w-full aspect-[2/1] object-cover" />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.category && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{post.category.name}</span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4 italic">{post.excerpt}</p>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none text-foreground leading-relaxed">
          {post.content.split('\n').map((paragraph: string, i: number) => {
            if (!paragraph.trim()) return <br key={i} />;
            // Support basic markdown-like headers
            if (paragraph.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-8 mb-4">{paragraph.slice(3)}</h2>;
            if (paragraph.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-6 mb-3">{paragraph.slice(4)}</h3>;
            if (paragraph.startsWith('- ')) return <li key={i} className="ml-4 text-muted-foreground">{paragraph.slice(2)}</li>;
            return <p key={i} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
          })}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag: any) => (
                <span key={tag.id} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground">{tag.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h3 className="text-lg font-semibold">Ready to improve your ad strategy?</h3>
          <p className="text-sm text-muted-foreground mt-2">Try Adxura free — AI-powered ad intelligence and generation.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors mt-4 text-sm">Get Started Free</Link>
        </div>
      </article>
    </PublicLayout>
  );
}
