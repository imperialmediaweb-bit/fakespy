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
      </div>
    </div>
  );
}
