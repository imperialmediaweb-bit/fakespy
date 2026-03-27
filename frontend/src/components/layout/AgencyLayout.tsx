import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, FolderOpen, Search, Sparkles, Download, FileText, CreditCard, Settings, LogOut, Menu, type LucideIcon } from 'lucide-react';

interface NavItem { href: string; label: string; icon: LucideIcon }

function Sidebar({ items, pathname, onNav }: { items: NavItem[]; pathname: string; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Link to="/agency" className="text-lg font-bold text-primary">Adxura <span className="text-xs text-muted-foreground font-normal">Agency</span></Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
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

export function AgencyLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: '/agency', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agency/clients', label: 'Clients', icon: Users },
    { href: '/agency/projects', label: 'Projects', icon: FolderOpen },
    { href: '/agency/analyses', label: 'Analyses', icon: Search },
    { href: '/agency/generations', label: 'Generations', icon: Sparkles },
    { href: '/agency/reports', label: 'Reports', icon: FileText },
    { href: '/agency/billing', label: 'Billing', icon: CreditCard },
    { href: '/agency/settings', label: 'Settings', icon: Settings },
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
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
