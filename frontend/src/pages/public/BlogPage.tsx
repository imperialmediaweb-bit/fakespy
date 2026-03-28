import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { blogApi } from '@/api/newModules';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { FileText, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    blogApi.getPublishedPosts(page, 9)
      .then(r => { setPosts(r.data.data.posts); setPagination(r.data.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Blog</h1>
          <p className="mt-3 text-muted-foreground text-lg">Insights on ad strategy, marketing intelligence, and AI-powered advertising.</p>
        </div>

        {loading ? <LoadingSpinner text="Loading articles..." /> : posts.length === 0 ? (
          <EmptyState icon={FileText} title="No articles yet" description="Check back soon for marketing insights and platform updates." />
        ) : (
          <>
            {/* Featured post — first article gets a large card */}
            {posts.length > 0 && (
              <Link to={`/blog/${posts[0].slug}`} className="block mb-12 group">
                <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                  {posts[0].featuredImage ? (
                    <div className="aspect-[21/9] overflow-hidden bg-muted">
                      <img src={posts[0].featuredImage} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-[21/9] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                      <FileText className="h-16 w-16 text-primary/20" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-3">
                      {posts[0].category && <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{posts[0].category.name}</span>}
                      <span className="text-xs text-muted-foreground">{new Date(posts[0].publishedAt || posts[0].createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{posts[0].title}</h2>
                    {posts[0].excerpt && <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{posts[0].excerpt}</p>}
                    <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">Read article <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts in grid */}
            {posts.length > 1 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(1).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                      {post.featuredImage ? (
                        <div className="aspect-[16/9] overflow-hidden bg-muted">
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                          <FileText className="h-10 w-10 text-primary/20" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.category && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{post.category.name}</span>}
                          <span className="text-xs text-muted-foreground">{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                        {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">{post.excerpt}</p>}
                        <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 font-medium">Read more <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-5 py-2.5 text-sm border border-border rounded-lg disabled:opacity-30 hover:bg-muted/50 transition-colors">Previous</button>
                <span className="px-4 py-2.5 text-sm text-muted-foreground">Page {page} of {pagination.totalPages}</span>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-5 py-2.5 text-sm border border-border rounded-lg disabled:opacity-30 hover:bg-muted/50 transition-colors">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
