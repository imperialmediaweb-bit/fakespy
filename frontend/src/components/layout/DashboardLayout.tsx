import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FolderOpen, Search, Sparkles, Download, CreditCard, Settings, Briefcase } from 'lucide-react';
import { AppShell, type NavItem } from './AppShell';

export function DashboardLayout() {
  const { user } = useAuth();
  const isAgency = user?.subscription?.plan === 'AGENCY';

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAgency ? [{ href: '/dashboard/agency', label: 'Agency', icon: Briefcase }] : []),
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
    { href: '/dashboard/analyses', label: 'Analyses', icon: Search },
    { href: '/dashboard/generations', label: 'Generations', icon: Sparkles },
    { href: '/dashboard/exports', label: 'Exports', icon: Download },
    { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return <AppShell items={items} home="/dashboard" />;
}
