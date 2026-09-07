/** Single source of FAQ content for /faq, the homepage, and FAQPage JSON-LD. */
export const FAQS = [
  { q: 'What is Adxura?', a: 'Adxura is an AI-powered ad intelligence and generation platform. It helps marketers analyze competitive ad strategies and generate high-converting ad copy for Facebook, Google, video, and more.' },
  { q: 'Does Adxura scrape real competitor ads?', a: 'Not yet. Adxura provides AI-inferred competitive analysis based on your inputs — brand, niche, audience, and competitors. Every insight is clearly labeled as AI analysis. Integrations with real ad libraries (Meta, Google) are on the roadmap.' },
  { q: 'What types of ads can I generate?', a: 'Facebook ads, Google Search ads, video ad scripts, hooks, CTAs, and full multi-platform campaign briefs. Each type is optimized for its platform, and you can generate five stylistic variations of any ad.' },
  { q: 'What AI model powers the analysis and generation?', a: 'Adxura uses OpenAI GPT-4o for both competitive analysis and ad generation. The platform is architected to support additional providers such as Anthropic and Gemini, configurable from the admin panel.' },
  { q: 'Is there a free plan?', a: 'Yes. The free plan includes 3 analyses, 10 ad generations, and 3 projects per month. No credit card required.' },
  { q: 'Can I use Adxura for client work?', a: 'Yes. The Agency plan supports 200 analyses, 1,000 generations, and unlimited projects per month, and groups your work by client.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel anytime through the billing portal. Your access continues until the end of the current billing period.' },
  { q: 'Is my data secure?', a: 'Yes. Data is stored in PostgreSQL with encrypted connections, passwords are hashed with bcrypt, stored API keys are encrypted with AES-256-GCM, authentication uses JWT with refresh tokens, and payments are processed by Stripe.' },
] as const;

export const HOMEPAGE_FAQ_COUNT = 5;

export function faqJsonLd(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
