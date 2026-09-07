import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { getApiErrorMessage } from '@/api/client';
import { LoadingSpinner, ErrorState, StatusBadge } from '@/components/shared';
import { chartTheme } from '@/lib/chartTheme';
import { Users, CreditCard, Search, Sparkles, FolderOpen, Download, TrendingUp, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { AdminUsageStats, AdminUser, AdminSubscription, Plan } from '@/types/api';

type Health = 'checking' | 'ready' | 'degraded';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminUsageStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [health, setHealth] = useState<Health>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true); setError('');
    Promise.all([adminApi.getUsageStats(), adminApi.getUsers(1, 5), adminApi.getSubscriptions(1, 100)])
      .then(([s, u, sub]) => { setStats(s.data.data); setUsers(u.data.data.users); setSubs(sub.data.data.subscriptions); })
      .catch(err => setError(getApiErrorMessage(err, 'Could not load admin dashboard')))
      .finally(() => setLoading(false));
    // Real readiness probe (DB connectivity) rather than a hardcoded "healthy" badge.
    fetch('/ready').then(r => setHealth(r.ok ? 'ready' : 'degraded')).catch(() => setHealth('degraded'));
  };
  useEffect(load, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error || !stats) return <ErrorState message={error || 'Stats unavailable'} onRetry={load} />;

  const planCounts: Record<Plan, number> = { FREE: 0, PRO: 0, AGENCY: 0 };
  subs.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] || 0) + 1; });
  const pieData = (Object.entries(planCounts) as [Plan, number][]).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const usageBarData = [
    { name: 'Analyses', value: stats.monthlyUsage.totalAnalyses },
    { name: 'Generations', value: stats.monthlyUsage.totalGenerations },
    { name: 'Exports', value: stats.monthlyUsage.totalExports },
  ];

  const statCards = [
    { label: 'Total users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/users' },
    { label: 'Paid subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10', href: '/admin/subscriptions' },
    { label: 'Total projects', value: stats.totalProjects, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/projects' },
    { label: 'Total analyses', value: stats.totalAnalyses, icon: Search, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/analyses' },
    { label: 'Total generations', value: stats.totalGenerations, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', href: '/admin/generations' },
    { label: 'Exports this month', value: stats.monthlyUsage.totalExports, icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/admin/exports' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview · {stats.currentMonth}</p>
        </div>
        <div className={`flex items-center gap-2 text-sm ${health === 'ready' ? 'text-green-400' : health === 'degraded' ? 'text-red-400' : 'text-muted-foreground'}`} role="status">
          {health === 'degraded' ? <AlertTriangle className="h-4 w-4" aria-hidden="true" /> : <Activity className="h-4 w-4" aria-hidden="true" />}
          <span>{health === 'checking' ? 'Checking system…' : health === 'ready' ? 'System healthy' : 'Database unreachable'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} to={s.href} className="group border border-border rounded-xl bg-card p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg ${s.bg} p-2.5`}><s.icon className={`h-5 w-5 ${s.color}`} aria-hidden="true" /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 border border-border rounded-xl bg-card p-6" aria-labelledby="adm-usage">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="adm-usage" className="font-semibold">Monthly Usage</h2>
            <span className="text-xs text-muted-foreground ml-auto">{stats.currentMonth}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={usageBarData} barSize={48}>
              <XAxis dataKey="name" tick={chartTheme.axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={chartTheme.axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartTheme.tooltip} cursor={{ fill: chartTheme.primaryFill }} />
              <Bar dataKey="value" fill={chartTheme.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="adm-plans">
          <h2 id="adm-plans" className="font-semibold mb-6">Plan Distribution</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={chartTheme.series[i % chartTheme.series.length]} />)}
                  </Pie>
                  <Tooltip {...chartTheme.tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-1 mt-2 list-none p-0 m-0">
                {pieData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartTheme.series[i % chartTheme.series.length] }} aria-hidden="true" />
                    <span className="text-muted-foreground flex-1">{d.name}</span>
                    <span className="font-medium tabular-nums">{d.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No subscription data</div>
          )}
        </section>
      </div>

      <section className="border border-border rounded-xl bg-card p-6" aria-labelledby="adm-recent">
        <div className="flex items-center justify-between mb-4">
          <h2 id="adm-recent" className="font-semibold">Recent Users</h2>
          <Link to="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <ul className="space-y-3 list-none p-0 m-0">
          {users.map(u => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>
              <StatusBadge status={u.subscription?.plan || 'FREE'} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
