import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { projectsApi } from '@/api/projects';
import { LoadingSpinner, UsageBar, StatusBadge } from '@/components/shared';
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
  const plan = (user?.subscription?.plan || 'FREE') as Plan;
  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    Promise.all([settingsApi.getSettings(), projectsApi.list(1, 5)])
      .then(([s, p]) => { setUsage(s.data.data.usage); setProjects(p.data.data.projects); setTotalProjects(p.data.data.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const usageData = usage ? [
    { name: 'Analyses', used: usage.analysesUsed, limit: limits.analysesPerMonth },
    { name: 'Generations', used: usage.generationsUsed, limit: limits.generationsPerMonth },
    { name: 'Exports', used: usage.exportsUsed, limit: limits.exportsPerMonth },
  ] : [];

  const chartData = usage ? [
    { name: 'Analyses', value: usage.analysesUsed },
    { name: 'Generations', value: usage.generationsUsed },
    { name: 'Exports', value: usage.exportsUsed },
  ] : [];

  const quickStats = [
    { label: 'Projects', value: totalProjects, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/dashboard/projects' },
    { label: 'Analyses Used', value: usage?.analysesUsed || 0, icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/dashboard/analyses' },
    { label: 'Generations Used', value: usage?.generationsUsed || 0, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', href: '/dashboard/generations' },
    { label: 'Exports Used', value: usage?.exportsUsed || 0, icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/dashboard/exports' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your activity this month</p>
        </div>
        <Link to="/dashboard/projects/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map(s => (
          <Link key={s.label} to={s.href} className="group border border-border rounded-xl bg-card p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg ${s.bg} p-2`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Usage Chart */}
        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Monthly Usage</h3>
          </div>
          {chartData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1b2e', border: '1px solid #2e303a', borderRadius: 8, color: '#e5e7eb' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No usage yet this month. Start a project!</div>
          )}
        </div>

        {/* Plan & Limits */}
        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Plan & Limits</h3>
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
            <Link to="/dashboard/billing" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4">
              Upgrade plan <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="border border-border rounded-xl bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Projects</h3>
          <Link to="/dashboard/projects" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects yet</p>
            <Link to="/dashboard/projects/new" className="text-primary hover:underline text-xs mt-2 inline-block">Create your first project</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(p => (
              <Link key={p.id} to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><FolderOpen className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brandName}{p.niche ? ` · ${p.niche}` : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{p._count?.analyses || 0} analyses · {p._count?.adGenerations || 0} ads</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
