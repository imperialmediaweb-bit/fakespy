import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { PageHeader } from '@/components/shared';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileErr(''); setProfileMsg(''); setProfileLoading(true);
    try { await settingsApi.updateProfile({ name, email }); await refreshUser(); setProfileMsg('Saved'); } catch (err: any) { setProfileErr(err.response?.data?.error?.message || 'Failed'); }
    finally { setProfileLoading(false); }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setPwErr(''); setPwMsg(''); setPwLoading(true);
    try { await settingsApi.updatePassword({ currentPassword: currentPw, newPassword: newPw }); setPwMsg('Password updated'); setCurrentPw(''); setNewPw(''); } catch (err: any) { setPwErr(err.response?.data?.error?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  const inputClass = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";
  const tabs = [{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }] as const;

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t.label}</button>)}
      </div>
      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="max-w-md space-y-4">
          {profileErr && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{profileErr}</div>}
          {profileMsg && <div className="bg-green-500/10 text-green-400 text-sm p-3 rounded-lg flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{profileMsg}</div>}
          <div><label className="block text-sm font-medium mb-1.5">Name</label><input value={name} onChange={e => setName(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>
          <button type="submit" disabled={profileLoading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{profileLoading && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
        </form>
      )}
      {tab === 'password' && (
        <form onSubmit={changePw} className="max-w-md space-y-4">
          {pwErr && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{pwErr}</div>}
          {pwMsg && <div className="bg-green-500/10 text-green-400 text-sm p-3 rounded-lg flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{pwMsg}</div>}
          <div><label className="block text-sm font-medium mb-1.5">Current Password</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputClass} /></div>
          <div><label className="block text-sm font-medium mb-1.5">New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass} placeholder="Min 8 chars, uppercase, lowercase, number" /></div>
          <button type="submit" disabled={pwLoading} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{pwLoading && <Loader2 className="h-4 w-4 animate-spin" />} Change Password</button>
        </form>
      )}
    </div>
  );
}
