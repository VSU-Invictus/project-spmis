import { AppShell } from '../components/navigation/AppShell';
import { EmptyState } from '../components/ui';

interface ReservedPortalPageProps {
  role: 'faculty' | 'admin';
  title: string;
  navKey: string;
  breadcrumb: string;
}

export function ReservedPortalPage({ role, title, navKey, breadcrumb }: ReservedPortalPageProps) {
  return (
    <AppShell role={role} activeNavKey={navKey} breadcrumb={breadcrumb}>
      <div style={{ padding: '24px 0' }}>
        <h1 className="ui-page-title">{title}</h1>
        <EmptyState
          title={`${title} page is being prepared`}
          description="This route is registered. Its page content will be added by the frontend implementation."
        />
      </div>
    </AppShell>
  );
}
