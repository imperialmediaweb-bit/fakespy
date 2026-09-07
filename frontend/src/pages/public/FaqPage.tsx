import { PublicLayout } from '@/components/layout/PublicLayout';
import { FAQS, faqJsonLd } from '@/lib/faqs';
import { useSeo, PUBLIC_ROUTE_SEO } from '@/lib/seo';

export default function FaqPage() {
  useSeo({ ...PUBLIC_ROUTE_SEO['/faq'], canonical: '/faq', jsonLd: faqJsonLd(FAQS) });

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {FAQS.map(f => (
            <details key={f.q} className="group border border-border rounded-lg bg-card open:border-primary/30 transition-colors">
              <summary className="cursor-pointer list-none p-5 font-semibold flex items-center justify-between gap-4">
                <h2 className="text-base font-semibold">{f.q}</h2>
                <span className="text-muted-foreground transition-transform group-open:rotate-45 shrink-0" aria-hidden="true">+</span>
              </summary>
              <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
