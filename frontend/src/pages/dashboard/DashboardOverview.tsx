import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { projectsApi } from '@/api/projects';
import { getApiErrorMessage } from '@/api/client';
import { LoadingSpinner, ErrorState, UsageBar, StatusBadge, btnPrimary } from '@/components/shared';
import { chartTheme } from '@/lib/chartTheme';
import { FolderOpen, Plus, ArrowRight, Search, Sparkles, Download, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Usage, Project, Plan } from '@/types/api';
import { PLAN_LIMITS } from '@/types/api';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const plan = (user?.subscription?.plan || 'FREE') as Plan;
  const limits = PLAN_LIMITS[plan];

  const load = () => {
    setLoading(true); setError('');
    Promise.all([settingsApi.getSettings(), projectsApi.list(1, 5)])
      .then(([s, p]) => { setUsage(s.data.data.usage); setProjects(p.data.data.projects); setTotalProjects(p.data.data.pagination.total); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load your dashboard')))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const chartData = usage ? [
    { name: 'Analyses', value: usage.analysesUsed },
    { name: 'Generations', value: usage.generationsUsed },
    { name: 'Exports', value: usage.exportsUsed },
  ] : [];

  const quickStats = [
    { label: 'Projects', value: totalProjects, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/dashboard/projects' },
    { label: 'Analyses used', value: usage?.analysesUsed || 0, icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/dashboard/analyses' },
    { label: 'Generations used', value: usage?.generationsUsed || 0, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', href: '/dashboard/generations' },
    { label: 'Exports used', value: usage?.exportsUsed || 0, icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/dashboard/exports' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your activity this month</p>
        </div>
        <Link to="/dashboard/projects/new" className={`${btnPrimary} px-5 py-2.5 text-sm`}><Plus className="h-4 w-4" aria-hidden="true" /> New Project</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map(s => (
          <Link key={s.label} to={s.href} className="group border border-border rounded-xl bg-card p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg ${s.bg} p-2`}><s.icon className={`h-4 w-4 ${s.color}`} aria-hidden="true" /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="dash-usage">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="dash-usage" className="font-semibold">Monthly Usage</h2>
          </div>
          {chartData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTheme.tooltip} cursor={{ fill: chartTheme.primaryFill }} />
                <Bar dataKey="value" fill={chartTheme.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No usage yet this month. Start a project!</div>
          )}
        </section>

        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="dash-plan">
          <div className="flex items-center justify-between mb-6">
            <h2 id="dash-plan" className="font-semibold">Plan &amp; Limits</h2>
            <StatusBadge status={plan} />
          </div>
          {usage && (
            <div className="space-y-5">
              <UsageBar label="Analyses" used={usage.analysesUsed} limit={limits.analysesPerMonth} />
              <UsageBar label="Generations" used={usage.generationsUsed} limit={limits.generationsPerMonth} />
              <UsageBar label="Exports" used={usage.exportsUsed} limit={limits.exportsPerMonth} />
              <UsageBar label="Projects" used={totalProjects} limit={limits.maxProjects} />
            </div>
          )}
          {plan === 'FREE' && (
            <Link to="/dashboard/billing" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4">Upgrade plan <ArrowRight className="h-3 w-3" aria-hidden="true" /></Link>
          )}
        </section>
      </div>

      <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="dash-recent">
        <div className="flex items-center justify-between mb-4">
          <h2 id="dash-recent" className="font-semibold">Recent Projects</h2>
          <Link to="/dashboard/projects" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p className="text-sm">No projects yet</p>
            <Link to="/dashboard/projects/new" className="text-primary hover:underline text-xs mt-2 inline-block">Create your first project</Link>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0">
            {projects.map(p => (
              <li key={p.id}>
                <Link to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0"><FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.brandName}{p.niche ? ` · ${p.niche}` : ''}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 tabular-nums">{p._count?.analyses || 0} analyses · {p._count?.adGenerations || 0} ads</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
