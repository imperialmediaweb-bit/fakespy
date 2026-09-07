import { useEffect } from 'react';

const SITE_NAME = 'Adxura';
const DEFAULT_DESCRIPTION =
  'AI-powered ad intelligence and generation. Analyze competitor strategies, generate Facebook and Google ads, video scripts, hooks and CTAs, and manage campaigns from one platform.';

export interface SeoOptions {
  title: string;
  description?: string;
  /** Absolute or root-relative canonical path. Defaults to current location. */
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data: Record<string, unknown> | undefined) {
  const id = 'seo-jsonld';
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Applies page SEO metadata (title, description, canonical, Open Graph,
 * Twitter card, robots, JSON-LD) via the document head. Runs as an effect so
 * it is safe with React's render model and re-applies when inputs change.
 */
export function useSeo(opts: SeoOptions) {
  const { title, description, canonical, image, type, noindex, jsonLd } = opts;
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    const desc = description || DEFAULT_DESCRIPTION;
    const origin = window.location.origin;
    const url = canonical ? (canonical.startsWith('http') ? canonical : origin + canonical) : origin + window.location.pathname;
    const ogImage = image || `${origin}/og-image.svg`;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: desc });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' });
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type || 'website' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: desc });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: desc });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });

    setJsonLd(jsonLd);
  }, [title, description, canonical, image, type, noindex, jsonLdKey]);
}

/** Static SEO for public marketing routes, keyed by pathname. */
export const PUBLIC_ROUTE_SEO: Record<string, Omit<SeoOptions, 'canonical'>> = {
  '/': { title: 'Adxura – AI Ad Intelligence & Generation', description: DEFAULT_DESCRIPTION },
  '/features': { title: 'Features', description: 'Competitive ad intelligence, AI ad generation for Facebook and Google, video scripts, hooks, CTAs, ad scoring, audience profiles and exports.' },
  '/pricing': { title: 'Pricing', description: 'Start free with 3 analyses and 10 ad generations per month. Upgrade to Pro or Agency for higher limits and unlimited projects.' },
  '/blog': { title: 'Blog', description: 'Insights on ad strategy, competitive intelligence and AI-powered advertising from the Adxura team.' },
  '/faq': { title: 'FAQ', description: 'Answers about how Adxura analyzes competitors, which AI powers it, plan limits, agency use, billing and data security.' },
  '/contact': { title: 'Contact', description: 'Get in touch with the Adxura team for questions, feedback or partnership requests.' },
  '/privacy': { title: 'Privacy Policy', description: 'How Adxura collects, uses and protects your data.' },
  '/terms': { title: 'Terms of Service', description: 'The terms that govern use of the Adxura platform and subscriptions.' },
};
