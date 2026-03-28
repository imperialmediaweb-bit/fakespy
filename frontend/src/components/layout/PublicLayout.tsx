import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdxuraLogo } from '@/components/shared/AdxuraLogo';

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="hover:opacity-90 transition-opacity"><AdxuraLogo size="default" /></Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.href} to={l.href} className={`text-sm transition-colors hover:text-foreground ${location.pathname === l.href ? 'text-foreground' : 'text-muted-foreground'}`}>{l.label}</Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">Get Started</Link>
          </div>
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background px-4 py-4 space-y-3">
            {navLinks.map(l => <Link key={l.href} to={l.href} className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>{l.label}</Link>)}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Log in</Link>
              <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">Get Started</Link>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/features" className="block hover:text-foreground">Features</Link>
                <Link to="/pricing" className="block hover:text-foreground">Pricing</Link>
                <Link to="/faq" className="block hover:text-foreground">FAQ</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/contact" className="block hover:text-foreground">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
              </div>
            </div>
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
