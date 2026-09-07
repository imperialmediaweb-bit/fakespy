import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { InlineAlert, inputClass, btnPrimary } from '@/components/shared';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="hover:opacity-90 transition-opacity inline-block" aria-label="Adxura home"><AdxuraLogo size="default" /></Link>
          <h1 className="text-xl font-semibold mt-4">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start analyzing and generating ads for free</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <InlineAlert onDismiss={() => setError('')}>{error}</InlineAlert>}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5">Name</label>
            <input id="reg-name" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Your name" aria-invalid={!!fieldErrors.name} />
            {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" aria-invalid={!!fieldErrors.email} />
            {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">Password</label>
            <input id="reg-password" type="password" required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Min 8 chars, uppercase, lowercase, number" aria-invalid={!!fieldErrors.password} aria-describedby="reg-password-hint" />
            <p id="reg-password-hint" className={`text-xs mt-1 ${fieldErrors.password ? 'text-destructive' : 'text-muted-foreground'}`}>{fieldErrors.password || 'At least 8 characters with an uppercase letter, a lowercase letter and a number.'}</p>
          </div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Create Account
          </button>
          <p className="text-xs text-muted-foreground text-center">By signing up you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
      </div>
    </main>
  );
}
