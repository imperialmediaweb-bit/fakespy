import { useEffect, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { blogApi } from '@/api/newModules';
import { LoadingSpinner, ErrorState } from '@/components/shared';
import { useSeo } from '@/lib/seo';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

/**
 * Renders the lightweight markdown subset used by the admin editor:
 * `## ` / `### ` headings, `- ` bullet lists (grouped into a real <ul>),
 * blank lines as paragraph breaks.
 */
function renderContent(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc pl-6 mb-4 space-y-1 text-muted-foreground">
        {listBuffer.map((item, i) => <li key={i}>{item}</li>)}
      </ul>,
    );
    listBuffer = [];
  };

  content.split('\n').forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) { listBuffer.push(trimmed.slice(2)); return; }
    flushList(`ul-${i}`);
    if (!trimmed) return;
    if (trimmed.startsWith('## ')) { nodes.push(<h2 key={i} className="text-xl font-bold mt-8 mb-4">{trimmed.slice(3)}</h2>); return; }
    if (trimmed.startsWith('### ')) { nodes.push(<h3 key={i} className="text-lg font-semibold mt-6 mb-3">{trimmed.slice(4)}</h3>); return; }
    nodes.push(<p key={i} className="text-muted-foreground mb-4 leading-relaxed">{trimmed}</p>);
  });
  flushList('ul-end');
  return nodes;
}

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

  const published = post?.publishedAt || post?.createdAt;
  const canonical = slug ? `/blog/${slug}` : '/blog';

  // Hook must run unconditionally; falls back to generic values until the post loads.
  useSeo({
    title: post ? (post.seoTitle || post.title) : 'Blog',
    description: post ? (post.seoDescription || post.excerpt || undefined) : undefined,
    canonical,
    image: post?.featuredImage || undefined,
    type: 'article',
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.seoDescription || post.excerpt || undefined,
          image: post.featuredImage || undefined,
          datePublished: published,
          dateModified: post.updatedAt || published,
          keywords: post.seoKeywords || undefined,
          articleSection: post.category?.name || undefined,
          author: { '@type': 'Organization', name: 'Adxura' },
          publisher: { '@type': 'Organization', name: 'Adxura' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': window.location.origin + canonical },
        }
      : undefined,
  });

  if (loading) return <PublicLayout><div className="max-w-3xl mx-auto px-4 py-16"><LoadingSpinner /></div></PublicLayout>;
  if (error || !post) return <PublicLayout><div className="max-w-3xl mx-auto px-4 py-16"><ErrorState message={error || 'Article not found'} /></div></PublicLayout>;

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Blog
        </Link>

        {post.featuredImage && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-border">
            <img src={post.featuredImage} alt={post.title} className="w-full aspect-[2/1] object-cover" loading="eager" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.category && (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{post.category.name}</span>
          )}
          <time dateTime={published} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {new Date(published).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-6">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4 italic">{post.excerpt}</p>
        )}

        <div className="max-w-none text-foreground leading-relaxed">
          {renderContent(post.content)}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border/50">
            <ul className="flex items-center gap-2 flex-wrap list-none p-0 m-0" aria-label="Tags">
              <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {post.tags.map((tag: any) => (
                <li key={tag.id} className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground">{tag.name}</li>
              ))}
            </ul>
          </div>
        )}

        <aside className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-lg font-semibold">Ready to improve your ad strategy?</h2>
          <p className="text-sm text-muted-foreground mt-2">Try Adxura free — AI-powered ad intelligence and generation.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors mt-4 text-sm">Get Started Free</Link>
        </aside>
      </article>
    </PublicLayout>
  );
}
