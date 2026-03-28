import { AdxuraLogo } from '@/components/shared/AdxuraLogo';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="hover:opacity-90 transition-opacity inline-block"><AdxuraLogo size="default" /></Link>
          <h1 className="text-xl font-semibold mt-4">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="text-right"><Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link></div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>

        {/* Demo accounts */}
        <div className="mt-8 border border-border/50 rounded-xl bg-card/50 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 text-center">Try a demo account</p>
          <div className="space-y-2">
            {[
              { label: 'Pro Account', email: 'pro@adxura.com', password: 'Pro12345!', badge: 'PRO', color: 'bg-primary/10 text-primary border-primary/20' },
              { label: 'Agency Account', email: 'agency@adxura.com', password: 'Agency123!', badge: 'AGENCY', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
            ].map(demo => (
              <button
                key={demo.email}
                type="button"
                onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium">{demo.label}</p>
                  <p className="text-xs text-muted-foreground">{demo.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${demo.color}`}>{demo.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
