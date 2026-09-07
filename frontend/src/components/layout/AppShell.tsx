import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';

export interface NavItem { href: string; label: string; icon: LucideIcon }

function Sidebar({ items, pathname, home, badge, onNav }: { items: NavItem[]; pathname: string; home: string; badge?: ReactNode; onNav?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Link to={home} className="hover:opacity-90 transition-opacity flex items-center gap-2" onClick={onNav}>
          <AdxuraLogo size="sm" />{badge}
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== home && pathname.startsWith(item.href + '/'));
          return (
            <Link key={item.href} to={item.href} onClick={onNav} aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Shared authenticated shell: fixed sidebar on desktop, drawer on mobile,
 * header with user + logout. Used by both the user dashboard and admin.
 */
export function AppShell({ items, home, badge, headerSuffix, children }: { items: NavItem[]; home: string; badge?: ReactNode; headerSuffix?: string; children?: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the drawer on route change and on Escape.
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:flex-col w-60 border-r border-border/50 bg-card fixed inset-y-0 left-0 z-30">
        <Sidebar items={items} pathname={location.pathname} home={home} badge={badge} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="fixed inset-y-0 left-0 w-60 bg-card border-r border-border/50 z-50" role="dialog" aria-modal="true" aria-label="Navigation">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute top-4 right-3 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Sidebar items={items} pathname={location.pathname} home={home} badge={badge} onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-20 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8">
          <button type="button" className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{user?.name}{headerSuffix ? ` ${headerSuffix}` : ''}</span>
            <button type="button" onClick={handleLogout} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Log out" title="Log out">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
