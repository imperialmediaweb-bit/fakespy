import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { getApiErrorMessage } from '@/api/client';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await authApi.forgotPassword(email); setSent(true); }
    catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="hover:opacity-90 transition-opacity inline-block" aria-label="Adxura home"><AdxuraLogo size="default" /></Link>
          <h1 className="text-xl font-semibold mt-4">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll send you a reset link</p>
        </div>
        {sent ? (
          <div className="text-center py-8 border border-border rounded-xl bg-card p-6" role="status">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground mt-2">If an account with that email exists, we've sent a password reset link.</p>
            <Link to="/login" className="text-sm text-primary hover:underline mt-4 inline-block">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium mb-1.5">Email</label>
              <input id="forgot-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Send Reset Link
            </button>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground mt-6"><Link to="/login" className="text-primary hover:underline">Back to login</Link></p>
      </div>
    </main>
  );
}
