import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSeo } from '@/lib/seo';
import { btnPrimary, btnSecondary } from '@/components/shared';

/** Real 404 (noindex) instead of silently redirecting bad URLs to the homepage. */
export default function NotFoundPage() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <PublicLayout>
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-3xl font-bold mt-2">Page not found</h1>
        <p className="text-muted-foreground mt-3">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to="/" className={`${btnPrimary} px-5 py-2.5 text-sm`}>Go home</Link>
          <Link to="/blog" className={`${btnSecondary} px-5 py-2.5 text-sm`}>Read the blog</Link>
        </div>
      </main>
    </PublicLayout>
  );
}
