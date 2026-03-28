import { PublicLayout } from '@/components/layout/PublicLayout';
const faqs = [
  { q: 'What is Adxura?', a: 'Adxura is an AI-powered ad intelligence and generation platform. It helps marketers analyze competitive ad strategies and generate high-converting ad copy for Facebook, Google, video, and more.' },
  { q: 'Does Adxura show real competitor ads?', a: 'Currently, Adxura provides AI-inferred competitive analysis based on your inputs. All insights are clearly labeled as AI analysis. Integrations with real ad libraries (Meta, Google) are planned for the future.' },
  { q: 'What types of ads can I generate?', a: 'Facebook ads, Google Search ads, video ad scripts, hooks, CTAs, and full multi-platform campaign briefs. Each type is optimized for its platform.' },
  { q: 'What AI model is used?', a: 'Adxura uses OpenAI GPT-4o for analysis and generation. The architecture supports adding more AI providers (Anthropic, Gemini) in the future.' },
  { q: 'Is there a free plan?', a: 'Yes. The free plan includes 3 analyses, 10 ad generations, and 3 projects per month. No credit card required.' },
  { q: 'Can I use Adxura for my agency?', a: 'Yes. The Agency plan supports 200 analyses, 1,000 generations, and unlimited projects per month. It is designed for managing multiple client workloads.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel anytime through the billing portal. Your access continues until the end of the current billing period.' },
  { q: 'Is my data secure?', a: 'Yes. We use PostgreSQL with encrypted connections, bcrypt for password hashing, AES-256-GCM for stored API keys, JWT for authentication, and Stripe for secure payment processing.' },
];
export default function FaqPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map(f => (
            <div key={f.q} className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
