import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { contactApi } from '@/api/contact';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setSending(true);
    try {
      await contactApi.send({ name: form.name, email: form.email, message: form.message, website: form.website || undefined });
      setSent(true);
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Could not send your message. Please try again.'));
    } finally { setSending(false); }
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4"><Mail className="h-6 w-6 text-primary" aria-hidden="true" /></div>
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-3 text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>
        </div>
        {sent ? (
          <div className="text-center py-12 border border-border rounded-xl bg-card" role="status">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Message sent</h2>
            <p className="text-muted-foreground mt-2">Thanks, {form.name}. We'll reply to {form.email} as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-xl bg-card p-8" noValidate>
            {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5">Name</label>
              <input id="contact-name" name="name" required minLength={2} maxLength={100} value={form.name} onChange={set('name')} className={inputClass} autoComplete="name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? 'contact-name-err' : undefined} />
              {fieldErrors.name && <p id="contact-name-err" className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">Email</label>
              <input id="contact-email" name="email" type="email" required value={form.email} onChange={set('email')} className={inputClass} autoComplete="email" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'contact-email-err' : undefined} />
              {fieldErrors.email && <p id="contact-email-err" className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5">Message</label>
              <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={5} value={form.message} onChange={set('message')} className={`${inputClass} resize-none`} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? 'contact-message-err' : undefined} />
              {fieldErrors.message && <p id="contact-message-err" className="text-xs text-destructive mt-1">{fieldErrors.message}</p>}
            </div>
            {/* Honeypot — hidden from real users, filled by bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>
            <button type="submit" disabled={sending} className={`${btnPrimary} w-full py-2.5`}>
              {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Send Message
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
