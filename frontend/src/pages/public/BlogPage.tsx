import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { blogApi } from '@/api/newModules';
import { getApiErrorMessage } from '@/api/client';
import { LoadingSpinner, EmptyState, ErrorState, Pagination } from '@/components/shared';
import { FileText, ArrowRight } from 'lucide-react';
import type { BlogPost, Pagination as PaginationType } from '@/types/api';

const fmt = (d: string, long = false) => new Date(d).toLocaleDateString('en-US', long ? { month: 'long', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });

function Cover({ post, wide }: { post: BlogPost; wide?: boolean }) {
  const ratio = wide ? 'aspect-[21/9]' : 'aspect-[16/9]';
  // Alt is intentionally empty: the image is decorative next to the visible title.
  return post.featuredImage ? (
    <div className={`${ratio} overflow-hidden bg-muted`}>
      <img src={post.featuredImage} alt="" loading={wide ? 'eager' : 'lazy'} decoding="async" width={wide ? 1200 : 640} height={wide ? 514 : 360} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
  ) : (
    <div className={`${ratio} bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center`}>
      <FileText className={`${wide ? 'h-16 w-16' : 'h-10 w-10'} text-primary/20`} aria-hidden="true" />
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true); setError('');
    blogApi.getPublishedPosts(page, 9)
      .then(r => { setPosts(r.data.data.posts); setPagination(r.data.data.pagination); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load articles')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page]);

  const [featured, ...rest] = posts;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-3 text-muted-foreground text-lg">Insights on ad strategy, marketing intelligence, and AI-powered advertising.</p>
        </div>

        {loading ? <LoadingSpinner text="Loading articles..." /> : error ? <ErrorState message={error} onRetry={load} /> : posts.length === 0 ? (
          <EmptyState icon={FileText} title="No articles yet" description="Check back soon for marketing insights and platform updates." />
        ) : (
          <>
            {featured && page === 1 && (
              <article className="mb-12">
                <Link to={`/blog/${featured.slug}`} className="block group">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <Cover post={featured} wide />
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-3">
                        {featured.category && <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{featured.category.name}</span>}
                        <time dateTime={featured.publishedAt || featured.createdAt} className="text-xs text-muted-foreground">{fmt(featured.publishedAt || featured.createdAt, true)}</time>
                      </div>
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{featured.title}</h2>
                      {featured.excerpt && <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{featured.excerpt}</p>}
                      <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">Read article <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {(page === 1 ? rest : posts).length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(page === 1 ? rest : posts).map(post => (
                  <article key={post.id} className="h-full">
                    <Link to={`/blog/${post.slug}`} className="group block h-full">
                      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                        <Cover post={post} />
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{post.category.name}</span>}
                            <time dateTime={post.publishedAt || post.createdAt} className="text-xs text-muted-foreground">{fmt(post.publishedAt || post.createdAt)}</time>
                          </div>
                          <h2 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                          {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{post.excerpt}</p>}
                          <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">Read more <ArrowRight className="h-3 w-3" aria-hidden="true" /></span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {pagination && <Pagination page={page} totalPages={pagination.totalPages} onChange={p => { setPage(p); window.scrollTo({ top: 0 }); }} />}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
