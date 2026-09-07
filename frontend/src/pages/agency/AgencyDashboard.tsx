import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { projectsApi } from '@/api/projects';
import { getApiErrorMessage } from '@/api/client';
import { LoadingSpinner, ErrorState, UsageBar, StatusBadge, btnPrimary } from '@/components/shared';
import { chartTheme } from '@/lib/chartTheme';
import { FolderOpen, Users, Search, Sparkles, Plus, TrendingUp, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Usage, Project, Plan } from '@/types/api';
import { PLAN_LIMITS } from '@/types/api';

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const plan = (user?.subscription?.plan || 'FREE') as Plan;
  const limits = PLAN_LIMITS[plan];

  const load = () => {
    setLoading(true); setError('');
    Promise.all([settingsApi.getSettings(), projectsApi.list(1, 100)])
      .then(([s, p]) => { setUsage(s.data.data.usage); setProjects(p.data.data.projects); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load agency dashboard')))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingSpinner text="Loading agency dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  // Clients are projects grouped by brand name.
  const clientMap = new Map<string, Project[]>();
  projects.forEach(p => clientMap.set(p.brandName, [...(clientMap.get(p.brandName) || []), p]));
  const clients = Array.from(clientMap.entries()).map(([brand, projs]) => ({
    brand, projects: projs,
    totalAnalyses: projs.reduce((sum, p) => sum + (p._count?.analyses || 0), 0),
    totalGenerations: projs.reduce((sum, p) => sum + (p._count?.adGenerations || 0), 0),
  }));
  const pieData = clients.slice(0, 6).map(c => ({ name: c.brand, value: c.projects.length }));
  const chartData = usage ? [
    { name: 'Analyses', value: usage.analysesUsed },
    { name: 'Generations', value: usage.generationsUsed },
    { name: 'Exports', value: usage.exportsUsed },
  ] : [];

  const statCards = [
    { label: 'Clients', value: clients.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total projects', value: projects.length, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Analyses this month', value: usage?.analysesUsed || 0, icon: Search, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Generations this month', value: usage?.generationsUsed || 0, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agency Dashboard</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clients · {projects.length} projects</p>
        </div>
        <Link to="/dashboard/projects/new" className={`${btnPrimary} px-5 py-2.5 text-sm`}><Plus className="h-4 w-4" aria-hidden="true" /> New Project</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="border border-border rounded-xl bg-card p-5">
            <div className={`rounded-lg ${s.bg} p-2 w-fit mb-3`}><s.icon className={`h-4 w-4 ${s.color}`} aria-hidden="true" /></div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 border border-border rounded-xl bg-card p-6" aria-labelledby="ag-usage">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="ag-usage" className="font-semibold">Monthly Usage</h2>
            <StatusBadge status={plan} />
          </div>
          {chartData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...chartTheme.tooltip} cursor={{ fill: chartTheme.primaryFill }} />
                <Bar dataKey="value" fill={chartTheme.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">No usage yet this month</div>
          )}
          {usage && (
            <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
              <UsageBar label="Analyses" used={usage.analysesUsed} limit={limits.analysesPerMonth} />
              <UsageBar label="Generations" used={usage.generationsUsed} limit={limits.generationsPerMonth} />
              <UsageBar label="Exports" used={usage.exportsUsed} limit={limits.exportsPerMonth} />
            </div>
          )}
        </section>

        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="ag-clients-chart">
          <h2 id="ag-clients-chart" className="font-semibold mb-4">Clients by Projects</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={chartTheme.series[i % chartTheme.series.length]} />)}
                  </Pie>
                  <Tooltip {...chartTheme.tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-1 mt-2 list-none p-0 m-0">
                {pieData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartTheme.series[i % chartTheme.series.length] }} aria-hidden="true" />
                    <span className="text-muted-foreground flex-1 truncate">{d.name}</span>
                    <span className="font-medium tabular-nums">{d.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">No clients yet</div>
          )}
        </section>
      </div>

      <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="ag-clients">
        <h2 id="ag-clients" className="font-semibold mb-4">All Clients</h2>
        {clients.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p className="text-sm">No clients yet. Create a project to add your first client.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(c => (
              <article key={c.brand} className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Briefcase className="h-4 w-4 text-primary" aria-hidden="true" /></div>
                  <h3 className="font-semibold text-sm truncate">{c.brand}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold tabular-nums">{c.projects.length}</p><p className="text-[10px] text-muted-foreground">Projects</p></div>
                  <div><p className="text-lg font-bold tabular-nums">{c.totalAnalyses}</p><p className="text-[10px] text-muted-foreground">Analyses</p></div>
                  <div><p className="text-lg font-bold tabular-nums">{c.totalGenerations}</p><p className="text-[10px] text-muted-foreground">Ads</p></div>
                </div>
                <ul className="mt-3 space-y-1 list-none p-0 m-0">
                  {c.projects.slice(0, 3).map(p => (
                    <li key={p.id}><Link to={`/dashboard/projects/${p.id}`} className="block text-xs text-muted-foreground hover:text-primary truncate">→ {p.title}</Link></li>
                  ))}
                  {c.projects.length > 3 && <li className="text-xs text-muted-foreground">+{c.projects.length - 3} more</li>}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
