import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center" role="status" aria-live="polite">
        <Link to="/" className="hover:opacity-90 transition-opacity inline-block" aria-label="Adxura home"><AdxuraLogo size="default" /></Link>
        <div className="mt-8">
          {status === 'loading' && <><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" aria-hidden="true" /><p className="mt-4 text-muted-foreground">Verifying your email...</p></>}
          {status === 'success' && <><CheckCircle2 className="h-10 w-10 text-primary mx-auto" aria-hidden="true" /><h1 className="text-xl font-semibold mt-4">Email verified!</h1><p className="text-muted-foreground mt-2">Your email has been confirmed.</p><Link to="/dashboard" className="text-primary hover:underline text-sm mt-4 inline-block">Go to dashboard</Link></>}
          {status === 'error' && <><XCircle className="h-10 w-10 text-destructive mx-auto" aria-hidden="true" /><h1 className="text-xl font-semibold mt-4">Verification failed</h1><p className="text-muted-foreground mt-2">This link is invalid or has expired.</p><Link to="/login" className="text-primary hover:underline text-sm mt-4 inline-block">Go to login</Link></>}
        </div>
      </div>
    </main>
  );
}
