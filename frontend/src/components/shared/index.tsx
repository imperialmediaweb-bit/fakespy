import { Component, type ErrorInfo, type ReactNode, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, Inbox, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

/** Shared input styling so every form looks and focuses the same way. */
export const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export function LoadingSpinner({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3', className)} role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className={text ? 'text-sm text-muted-foreground' : 'sr-only'}>{text || 'Loading'}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-full bg-muted p-4"><Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" /></div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Something went wrong' }: { message?: string; onRetry?: () => void; title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center" role="alert">
      <div className="rounded-full bg-destructive/10 p-4"><AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" /></div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{message || 'An unexpected error occurred.'}</p>
      </div>
      {onRetry && <button type="button" onClick={onRetry} className="text-sm text-primary hover:underline">Try again</button>}
    </div>
  );
}

/** Inline banner for form/action errors and successes (replaces alert()). */
export function InlineAlert({ kind = 'error', children, onDismiss }: { kind?: 'error' | 'success' | 'info'; children: ReactNode; onDismiss?: () => void }) {
  const styles = {
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  }[kind];
  return (
    <div className={cn('flex items-start justify-between gap-3 text-sm p-3 rounded-lg border', styles)} role={kind === 'error' ? 'alert' : 'status'}>
      <div className="flex-1">{children}</div>
      {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">×</button>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    PUBLISHED: 'bg-green-500/10 text-green-400 border-green-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    SCHEDULED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    TRIALING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DRAFT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    UNPAID: 'bg-red-500/10 text-red-400 border-red-500/20',
    INCOMPLETE: 'bg-red-500/10 text-red-400 border-red-500/20',
    INCOMPLETE_EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/20',
    CANCELED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ARCHIVED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    PAST_DUE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    FREE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    PRO: 'bg-primary/10 text-primary border-primary/20',
    AGENCY: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    USER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const style = map[status] || 'bg-muted text-muted-foreground border-border';
  return <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap', style)}>{status.replace(/_/g, ' ')}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 100 : Math.min((used / limit) * 100, 100);
  const isNear = !isUnlimited && pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium tabular-nums', isNear ? 'text-warning' : '')}>
          {used}{isUnlimited ? <span className="text-muted-foreground font-normal"> · unlimited</span> : ` / ${limit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={isUnlimited ? undefined : limit} aria-valuenow={used}>
        <div className={cn('h-full rounded-full transition-all', isUnlimited ? 'bg-primary/30' : isNear ? 'bg-yellow-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex justify-center items-center gap-2 mt-6" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className={cn(btnSecondary, 'px-3 py-1.5 text-sm')} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
      </button>
      <span className="px-3 py-1.5 text-sm text-muted-foreground tabular-nums" aria-current="page">Page {page} of {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className={cn(btnSecondary, 'px-3 py-1.5 text-sm')} aria-label="Next page">
        Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export function DataTable<T extends Record<string, any>>({ columns, data, isLoading, error, onRetry, emptyTitle, emptyDescription, onRowClick, rowLabel }: {
  columns: { key: string; header: string; render?: (row: T) => ReactNode }[];
  data: T[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  /** Accessible name for clickable rows, e.g. row => `Open ${row.title}` */
  rowLabel?: (row: T) => string;
}) {
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (data.length === 0) return <EmptyState title={emptyTitle || 'No data'} description={emptyDescription} />;

  const onKey = (row: T) => (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRowClick(row); }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border bg-muted/50">
          {columns.map(c => <th key={c.key} scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{c.header}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              className={cn('border-b border-border/50 hover:bg-muted/30 transition-colors', onRowClick && 'cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? onKey(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              aria-label={onRowClick && rowLabel ? rowLabel(row) : undefined}
            >
              {columns.map(c => <td key={c.key} className="px-4 py-3 align-middle">{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Accessible tab bar: keyboard arrows + proper roles; scrolls horizontally on mobile. */
export function TabBar<K extends string>({ tabs, value, onChange }: { tabs: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex(t => t.key === value);
    if (e.key === 'ArrowRight') { e.preventDefault(); onChange(tabs[(idx + 1) % tabs.length].key); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onChange(tabs[(idx - 1 + tabs.length) % tabs.length].key); }
  };
  return (
    <div role="tablist" className="flex gap-1 mb-6 border-b border-border overflow-x-auto" onKeyDown={onKeyDown}>
      {tabs.map(t => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={value === t.key}
          tabIndex={value === t.key ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={cn('shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', value === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Catches render errors so one broken page never white-screens the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <ErrorState
            title="This page failed to render"
            message={this.state.error.message}
            onRetry={() => { this.setState({ error: null }); window.location.reload(); }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
