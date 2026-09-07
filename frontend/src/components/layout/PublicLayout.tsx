import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const footerGroups: { title: string; links: { href: string; label: string }[] }[] = [
  { title: 'Product', links: [{ href: '/features', label: 'Features' }, { href: '/pricing', label: 'Pricing' }, { href: '/blog', label: 'Blog' }, { href: '/faq', label: 'FAQ' }] },
  { title: 'Company', links: [{ href: '/contact', label: 'Contact' }] },
  { title: 'Legal', links: [{ href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms of Service' }] },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="hover:opacity-90 transition-opacity" aria-label="Adxura home"><AdxuraLogo size="default" /></Link>
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map(l => (
              <Link key={l.href} to={l.href} aria-current={location.pathname === l.href ? 'page' : undefined}
                className={`text-sm transition-colors hover:text-foreground ${location.pathname === l.href ? 'text-foreground' : 'text-muted-foreground'}`}>{l.label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">Get Started</Link>
          </div>
          <button type="button" className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-nav">
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
        {mobileOpen && (
          <nav id="mobile-nav" className="md:hidden border-t border-border/50 bg-background px-4 py-4 space-y-3" aria-label="Primary">
            {navLinks.map(l => <Link key={l.href} to={l.href} className="block text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>)}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Log in</Link>
              <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">Get Started</Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerGroups.map(g => (
              <nav key={g.title} aria-label={g.title}>
                <h2 className="font-semibold mb-4 text-sm">{g.title}</h2>
                <ul className="space-y-2 text-sm text-muted-foreground list-none p-0 m-0">
                  {g.links.map(l => <li key={l.href}><Link to={l.href} className="hover:text-foreground">{l.label}</Link></li>)}
                </ul>
              </nav>
            ))}
            <div>
              <div className="mb-4"><AdxuraLogo size="sm" /></div>
              <p className="text-sm text-muted-foreground">AI-powered ad intelligence and generation platform for marketers and agencies.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Adxura. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
