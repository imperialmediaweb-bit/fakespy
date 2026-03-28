import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/shared';
import { Users, CreditCard, Search, Sparkles, FolderOpen, Download, TrendingUp, Activity, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#7c3aed', '#a855f7', '#c084fc', '#6d28d9'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getUsageStats(), adminApi.getUsers(1, 5), adminApi.getSubscriptions(1, 100)])
      .then(([s, u, sub]) => { setStats(s.data.data); setUsers(u.data.data.users); setSubs(sub.data.data.subscriptions); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  // Plan distribution for pie chart
  const planCounts = { FREE: 0, PRO: 0, AGENCY: 0 };
  subs.forEach((s: any) => { if (s.plan in planCounts) planCounts[s.plan as keyof typeof planCounts]++; });
  const pieData = Object.entries(planCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  // Usage bar chart data
  const usageBarData = [
    { name: 'Analyses', value: stats?.monthlyUsage?.totalAnalyses || 0 },
    { name: 'Generations', value: stats?.monthlyUsage?.totalGenerations || 0 },
    { name: 'Exports', value: stats?.monthlyUsage?.totalExports || 0 },
  ];

  // Simulated activity trend from real totals (shows magnitude, not fake time series)
  const activityData = [
    { name: 'Projects', value: stats?.totalProjects || 0 },
    { name: 'Analyses', value: stats?.totalAnalyses || 0 },
    { name: 'Generations', value: stats?.totalGenerations || 0 },
  ];

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/users' },
    { label: 'Paid Subscriptions', value: stats?.activeSubscriptions || 0, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10', href: '/admin/subscriptions' },
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/projects' },
    { label: 'Total Analyses', value: stats?.totalAnalyses || 0, icon: Search, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/analyses' },
    { label: 'Total Generations', value: stats?.totalGenerations || 0, icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/10', href: '/admin/generations' },
    { label: 'This Month Exports', value: stats?.monthlyUsage?.totalExports || 0, icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-500/10', href: '/admin/exports' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview · {stats?.currentMonth}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Activity className="h-4 w-4" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(s => (
          <Link key={s.label} to={s.href} className="group border border-border rounded-xl bg-card p-5 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg ${s.bg} p-2.5`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Usage Bar Chart */}
        <div className="lg:col-span-2 border border-border rounded-xl bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Monthly Usage</h3>
            <span className="text-xs text-muted-foreground ml-auto">{stats?.currentMonth}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={usageBarData} barSize={48}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1b2e', border: '1px solid #2e303a', borderRadius: 8, color: '#e5e7eb' }} />
              <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution Pie Chart */}
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-6">Plan Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1b2e', border: '1px solid #2e303a', borderRadius: 8, color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No subscription data</div>
          )}
        </div>
      </div>

      {/* All-Time Totals Area */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl bg-card p-6">
          <h3 className="font-semibold mb-6">Platform Totals</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activityData}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1b2e', border: '1px solid #2e303a', borderRadius: 8, color: '#e5e7eb' }} />
              <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users */}
        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${u.subscription?.plan === 'AGENCY' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : u.subscription?.plan === 'PRO' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {u.subscription?.plan || 'FREE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
