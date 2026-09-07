import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { getApiErrorMessage, getApiFieldErrors } from '@/api/client';
import { PageHeader, InlineAlert, TabBar, inputClass, btnPrimary } from '@/components/shared';
import { Loader2 } from 'lucide-react';

type Tab = 'profile' | 'password';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileFieldErrs, setProfileFieldErrs] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwFieldErrs, setPwFieldErrs] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileErr(''); setProfileMsg(''); setProfileFieldErrs({}); setProfileLoading(true);
    try {
      const emailChanged = email.toLowerCase() !== (user?.email || '').toLowerCase();
      await settingsApi.updateProfile({ name, email });
      await refreshUser();
      setProfileMsg(emailChanged ? 'Saved. Please verify your new email address from the link we sent.' : 'Profile saved.');
    } catch (err) { setProfileFieldErrs(getApiFieldErrors(err)); setProfileErr(getApiErrorMessage(err, 'Could not save profile')); }
    finally { setProfileLoading(false); }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setPwErr(''); setPwMsg(''); setPwFieldErrs({}); setPwLoading(true);
    try { await settingsApi.updatePassword({ currentPassword: currentPw, newPassword: newPw }); setPwMsg('Password updated.'); setCurrentPw(''); setNewPw(''); }
    catch (err) { setPwFieldErrs(getApiFieldErrors(err)); setPwErr(getApiErrorMessage(err, 'Could not change password')); }
    finally { setPwLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your profile and account security." />
      <TabBar tabs={[{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }]} value={tab} onChange={setTab} />

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="max-w-md space-y-4" noValidate>
          {profileErr && <InlineAlert onDismiss={() => setProfileErr('')}>{profileErr}</InlineAlert>}
          {profileMsg && <InlineAlert kind="success" onDismiss={() => setProfileMsg('')}>{profileMsg}</InlineAlert>}
          <div>
            <label htmlFor="set-name" className="block text-sm font-medium mb-1.5">Name</label>
            <input id="set-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} aria-invalid={!!profileFieldErrs.name} />
            {profileFieldErrs.name && <p className="text-xs text-destructive mt-1">{profileFieldErrs.name}</p>}
          </div>
          <div>
            <label htmlFor="set-email" className="block text-sm font-medium mb-1.5">Email</label>
            <input id="set-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} aria-invalid={!!profileFieldErrs.email} />
            {profileFieldErrs.email && <p className="text-xs text-destructive mt-1">{profileFieldErrs.email}</p>}
            {user && !user.emailVerified && <p className="text-xs text-yellow-400 mt-1">Email not verified yet.</p>}
          </div>
          <button type="submit" disabled={profileLoading} className={`${btnPrimary} px-6 py-2 text-sm`}>{profileLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Save</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={changePw} className="max-w-md space-y-4" noValidate>
          {pwErr && <InlineAlert onDismiss={() => setPwErr('')}>{pwErr}</InlineAlert>}
          {pwMsg && <InlineAlert kind="success" onDismiss={() => setPwMsg('')}>{pwMsg}</InlineAlert>}
          <div>
            <label htmlFor="set-current-pw" className="block text-sm font-medium mb-1.5">Current password</label>
            <input id="set-current-pw" type="password" autoComplete="current-password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputClass} aria-invalid={!!pwFieldErrs.currentPassword} />
            {pwFieldErrs.currentPassword && <p className="text-xs text-destructive mt-1">{pwFieldErrs.currentPassword}</p>}
          </div>
          <div>
            <label htmlFor="set-new-pw" className="block text-sm font-medium mb-1.5">New password</label>
            <input id="set-new-pw" type="password" autoComplete="new-password" value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass} placeholder="Min 8 chars, uppercase, lowercase, number" aria-invalid={!!pwFieldErrs.newPassword} />
            {pwFieldErrs.newPassword && <p className="text-xs text-destructive mt-1">{pwFieldErrs.newPassword}</p>}
          </div>
          <button type="submit" disabled={pwLoading} className={`${btnPrimary} px-6 py-2 text-sm`}>{pwLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Change Password</button>
        </form>
      )}
    </div>
  );
}
