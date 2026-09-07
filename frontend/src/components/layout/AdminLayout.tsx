import { LayoutDashboard, Users, CreditCard, BarChart3, FolderOpen, Search, Sparkles, Download, ScrollText, Settings, FileText } from 'lucide-react';
import { AppShell, type NavItem } from './AppShell';

const items: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/usage', label: 'Usage', icon: BarChart3 },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/analyses', label: 'Analyses', icon: Search },
  { href: '/admin/generations', label: 'Generations', icon: Sparkles },
  { href: '/admin/exports', label: 'Exports', icon: Download },
  { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/system', label: 'System', icon: Settings },
];

export function AdminLayout() {
  return (
    <AppShell
      items={items}
      home="/admin"
      headerSuffix="(Admin)"
      badge={<span className="text-xs text-red-400 font-medium border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">Admin</span>}
    />
  );
}
