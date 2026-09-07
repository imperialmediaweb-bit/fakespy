import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  if (!token) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center"><h1 className="text-xl font-semibold">Invalid reset link</h1><p className="text-muted-foreground mt-2">This link is invalid or has expired.</p><Link to="/forgot-password" className="text-primary hover:underline text-sm mt-4 inline-block">Request a new link</Link></div>
    </main>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFieldError(''); setLoading(true);
    try { await authApi.resetPassword(token, password); setDone(true); setTimeout(() => navigate('/login'), 2000); }
    catch (err) { setFieldError(getApiFieldErrors(err).password || ''); setError(getApiErrorMessage(err, 'Failed to reset password')); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link to="/" className="hover:opacity-90 transition-opacity inline-block" aria-label="Adxura home"><AdxuraLogo size="default" /></Link><h1 className="text-xl font-semibold mt-4">Set new password</h1></div>
        {done ? (
          <div className="text-center py-8 border border-border rounded-xl bg-card p-6" role="status">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-semibold">Password reset!</h2>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium mb-1.5">New Password</label>
              <input id="reset-password" type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Min 8 chars, uppercase, lowercase, number" aria-invalid={!!fieldError} />
              {fieldError && <p className="text-xs text-destructive mt-1">{fieldError}</p>}
            </div>
            <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>{loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Reset Password</button>
          </form>
        )}
      </div>
    </main>
  );
}
