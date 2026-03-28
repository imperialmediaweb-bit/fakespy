import { PageHeader, EmptyState } from '@/components/shared';
import { Construction } from 'lucide-react';

export default function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState icon={Construction} title="Section available" description="This admin section is architecturally ready. Data will populate from the backend API endpoints that are already built and deployed." />
    </div>
  );
}
