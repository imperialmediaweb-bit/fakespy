import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, Inbox, type LucideIcon } from 'lucide-react';

export function LoadingSpinner({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-full bg-muted p-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4"><AlertCircle className="h-8 w-8 text-destructive" /></div>
      <div>
        <h3 className="text-lg font-semibold">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mt-1">{message || 'An unexpected error occurred.'}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="text-sm text-primary hover:underline">Try again</button>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
    CANCELED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    PAST_DUE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    FREE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    PRO: 'bg-primary/10 text-primary border-primary/20',
    AGENCY: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  };
  const style = map[status] || 'bg-muted text-muted-foreground border-border';
  return <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', style)}>{status}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNear = !isUnlimited && pct >= 80;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-medium', isNear ? 'text-warning' : '')}>{used}{isUnlimited ? '' : ` / ${limit}`}{isUnlimited && ' (unlimited)'}</span>
      </div>
      {!isUnlimited && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', isNear ? 'bg-yellow-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({ columns, data, isLoading, emptyTitle, emptyDescription, onRowClick }: {
  columns: { key: string; header: string; render?: (row: T) => ReactNode }[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}) {
  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (data.length === 0) return <EmptyState title={emptyTitle || 'No data'} description={emptyDescription} />;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border bg-muted/50">
          {columns.map(c => <th key={c.key} className="text-left px-4 py-3 font-medium text-muted-foreground">{c.header}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={cn('border-b border-border/50 hover:bg-muted/30 transition-colors', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>
              {columns.map(c => <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
