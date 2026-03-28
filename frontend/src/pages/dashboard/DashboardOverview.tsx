import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi } from '@/api/settings';
import { projectsApi } from '@/api/projects';
import { PageHeader, UsageBar, LoadingSpinner, StatusBadge } from '@/components/shared';
import { FolderOpen, Plus, ArrowRight } from 'lucide-react';
import type { Usage, Project, Plan } from '@/types/api';
import { PLAN_LIMITS } from '@/types/api';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const plan = (user?.subscription?.plan || 'FREE') as Plan;
  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    Promise.all([settingsApi.getSettings(), projectsApi.list(1, 5)])
      .then(([s, p]) => { setUsage(s.data.data.usage); setProjects(p.data.data.projects); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name}`} description="Here's an overview of your activity this month." actions={<Link to="/dashboard/projects" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Project</Link>} />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Plan & Usage</h3>
            <StatusBadge status={plan} />
          </div>
          {usage && (
            <div className="space-y-4">
              <UsageBar label="Analyses" used={usage.analysesUsed} limit={limits.analysesPerMonth} />
              <UsageBar label="Generations" used={usage.generationsUsed} limit={limits.generationsPerMonth} />
              <UsageBar label="Exports" used={usage.exportsUsed} limit={limits.exportsPerMonth} />
            </div>
          )}
          {plan === 'FREE' && <Link to="/dashboard/billing" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4">Upgrade plan <ArrowRight className="h-3 w-3" /></Link>}
        </div>

        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Projects</h3>
            <Link to="/dashboard/projects" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No projects yet</p>
              <Link to="/dashboard/projects" className="text-primary hover:underline text-xs mt-2 inline-block">Create your first project</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <Link key={p.id} to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brandName}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{p._count?.analyses || 0} analyses</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
