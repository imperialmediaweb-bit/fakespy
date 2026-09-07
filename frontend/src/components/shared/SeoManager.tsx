import { useLocation } from 'react-router-dom';
import { useSeo, PUBLIC_ROUTE_SEO } from '@/lib/seo';

const PRIVATE_PREFIXES = ['/dashboard', '/admin', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const PRIVATE_TITLES: Record<string, string> = {
  '/login': 'Sign in',
  '/register': 'Create account',
  '/forgot-password': 'Reset password',
  '/reset-password': 'Set new password',
  '/verify-email': 'Verify email',
};

/**
 * Route-level SEO for pages that do not manage their own metadata.
 * Dynamic pages (blog posts) call `useSeo` themselves and take precedence
 * because their effect runs after this one.
 */
export function SeoManager() {
  const { pathname } = useLocation();
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isBlogPost = pathname.startsWith('/blog/');

  const staticSeo = PUBLIC_ROUTE_SEO[pathname];
  const privateTitle = PRIVATE_TITLES[pathname] || (pathname.startsWith('/admin') ? 'Admin' : 'Dashboard');

  useSeo(
    isBlogPost
      ? { title: 'Blog', type: 'article' }
      : isPrivate
        ? { title: privateTitle, noindex: true }
        : staticSeo || { title: 'Adxura' },
  );

  return null;
}
