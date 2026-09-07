import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2 } from 'lucide-react';

// Demo accounts intentionally shown for evaluation (USER role, quota-limited plans).
const DEMO_ACCOUNTS = [
  { label: 'Pro Account', email: 'pro@adxura.com', password: 'Pro12345!', badge: 'PRO', color: 'bg-primary/10 text-primary border-primary/20' },
  { label: 'Agency Account', email: 'agency@adxura.com', password: 'Agency123!', badge: 'AGENCY', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Invalid email or password'));
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="hover:opacity-90 transition-opacity inline-block" aria-label="Adxura home"><AdxuraLogo size="default" /></Link>
          <h1 className="text-xl font-semibold mt-4">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" aria-invalid={!!fieldErrors.email} />
            {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium mb-1.5">Password</label>
            <input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} aria-invalid={!!fieldErrors.password} />
            {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
          </div>
          <div className="text-right"><Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link></div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Sign In
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>

        <section className="mt-8 border border-border/50 rounded-xl bg-card/50 p-4" aria-labelledby="demo-heading">
          <h2 id="demo-heading" className="text-xs font-medium text-muted-foreground mb-3 text-center">Try a demo account</h2>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(demo => (
              <button key={demo.email} type="button" onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors text-left">
                <span>
                  <span className="block text-sm font-medium">{demo.label}</span>
                  <span className="block text-xs text-muted-foreground">{demo.email}</span>
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${demo.color}`}>{demo.badge}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
