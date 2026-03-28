import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, CreditCard, BarChart3, FolderOpen, Search, Sparkles, Download, ScrollText, Settings, LogOut, Menu, FileText, type LucideIcon } from 'lucide-react';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';

interface NavItem { href: string; label: string; icon: LucideIcon }

function Sidebar({ items, pathname, onNav }: { items: NavItem[]; pathname: string; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Link to="/admin" className="hover:opacity-90 transition-opacity flex items-center gap-2"><AdxuraLogo size="sm" /><span className="text-xs text-red-400 font-medium border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded">Admin</span></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} to={item.href} onClick={onNav}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              <item.icon className="h-4 w-4 shrink-0" />{item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
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

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:flex-col w-60 border-r border-border/50 bg-card fixed inset-y-0 left-0 z-30">
        <Sidebar items={navItems} pathname={location.pathname} />
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-card border-r border-border/50 z-50">
            <Sidebar items={navItems} pathname={location.pathname} onNav={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name} (Admin)</span>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
