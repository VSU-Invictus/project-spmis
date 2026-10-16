import React from 'react';

export interface ActivityLogItem {
  id: string;
  title: string;
  time: string;
  description: string;
}

export interface SystemActivityLogProps {
  title?: string;
  subtitle?: string;
  items?: ActivityLogItem[];
  totalCount?: number;
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
  viewAllHref = '/admin/audit-log',
  onViewAll,
  className = '',
}: SystemActivityLogProps) {
  return (
    <aside
      className={`ui-card ui-dashboard-panel ui-dashboard-activity-panel ${className}`.trim()}
      aria-labelledby="activity-heading"
    >
      <div className="ui-dashboard-panel-header">
        <h2 id="activity-heading">{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="ui-dashboard-activity-list">
        {items.map((item) => (
          <article key={item.id} className="ui-dashboard-activity-item">
            <div>
              <h3>{item.title}</h3>
              <span className="ui-dashboard-time">{item.time}</span>
            </div>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
      <div className="ui-dashboard-activity-footer">
        <span>Showing {items.length} of {totalCount} logs</span>
        <a href={viewAllHref} className="ui-link-neutral" onClick={onViewAll}>
          View All Logs <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </aside>
  );
}

