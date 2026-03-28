import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4"><Mail className="h-6 w-6 text-primary" /></div>
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>
        </div>
        {sent ? (
          <div className="text-center py-12 border border-border rounded-xl bg-card">
            <h2 className="text-xl font-semibold text-primary">Message sent!</h2>
            <p className="text-muted-foreground mt-2">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-xl bg-card p-8">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" required className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea required rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">Send Message</button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
