import React from 'react';
import { ActionLink } from './Button';
import { useMinimumLoadingDuration } from './Skeleton';

export interface ActivityLogItem {
  id: string;
  title: string;
  time: string;
  description: string;
}

export interface ActivityLogItemCardProps {
  item: ActivityLogItem;
}

export function ActivityLogItemCard({ item }: ActivityLogItemCardProps) {
  return (
    <article className="ui-dashboard-activity-item">
      <div>
        <h3>{item.title}</h3>
        <span className="ui-dashboard-time">{item.time}</span>
      </div>
      <p>{item.description}</p>
    </article>
  );
}

export interface SystemActivityLogProps {
  title?: string;
  subtitle?: string;
  items?: ActivityLogItem[];
  totalCount?: number;
  isLoading?: boolean;
  viewAllHref?: string;
  onViewAll?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export const DEFAULT_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    title: 'User Permissions Updated',
    time: '10m ago',
    description: 'Admin updated role for Prof. Miller',
  },
  {
    id: 'log-2',
    title: 'Batch Students Enrolled',
    time: '1h ago',
    description: '18 new BS CS student profiles',
  },
  {
    id: 'log-3',
    title: 'System Backup Completed',
    time: '3h ago',
    description: 'Automated database backup #1049',
  },
];

export function SystemActivityLog({
  title = 'System Activity Log',
  subtitle = 'Recent Audits',
  items = DEFAULT_ACTIVITY_LOGS,
  totalCount = 128,
  isLoading: rawIsLoading = false,
  viewAllHref = '/admin/audit-log',
  onViewAll,
  className = '',
}: SystemActivityLogProps) {
  const isLoading = useMinimumLoadingDuration(rawIsLoading);
  return (
    <aside
      className={`ui-card ui-dashboard-panel ui-dashboard-activity-panel ${className}`.trim()}
      aria-labelledby="activity-heading"
    >
      <div className="ui-dashboard-panel-header">
        <h2 id="activity-heading">{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="ui-dashboard-activity-list" aria-busy={isLoading || undefined}>
        {isLoading
          ? [0, 1, 2].map((skeletonIdx) => (
              <article
                key={`activity-skeleton-${skeletonIdx}`}
                className="ui-dashboard-activity-item skeleton-row"
                aria-hidden="true"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div className="skeleton" style={{ width: '58%', height: '16px' }} />
                  <div className="skeleton" style={{ width: '48px', height: '14px' }} />
                </div>
                <div className="skeleton" style={{ width: '82%', height: '14px', marginTop: '6px' }} />
              </article>
            ))
          : items.map((item) => <ActivityLogItemCard key={item.id} item={item} />)}
      </div>
      <div className="ui-dashboard-activity-footer">
        <span>{isLoading ? 'Loading logs…' : `Showing ${items.length} of ${totalCount} logs`}</span>
        <ActionLink href={viewAllHref} onClick={onViewAll}>
          View All Logs
        </ActionLink>
      </div>
    </aside>
  );
}


