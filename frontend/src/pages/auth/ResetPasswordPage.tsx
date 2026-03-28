import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center"><h1 className="text-xl font-semibold">Invalid reset link</h1><p className="text-muted-foreground mt-2">This link is invalid or has expired.</p><Link to="/forgot-password" className="text-primary hover:underline text-sm mt-4 inline-block">Request a new link</Link></div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await authApi.resetPassword(token, password); setDone(true); setTimeout(() => navigate('/login'), 2000); }
    catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to reset password'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><Link to="/" className="text-2xl font-bold text-primary">Adxura</Link><h1 className="text-xl font-semibold mt-4">Set new password</h1></div>
        {done ? (
          <div className="text-center py-8 border border-border rounded-xl bg-card p-6">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="font-semibold">Password reset!</h2>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Min 8 chars, uppercase, lowercase, number" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
