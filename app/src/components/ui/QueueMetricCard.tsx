import React from 'react';
import type { QueueType } from '../queue-modal/queues';

export interface QueueMetricCardProps {
  queueType: QueueType;
  title?: string;
  count: number | string;
  actionLabel?: string;
  href?: string;
  icon?: React.ReactNode;
  onOpenQueue?: (queueType: QueueType) => void;
  className?: string;
}

const DEFAULT_TITLES: Record<QueueType, string> = {
  student: 'Students',
  department: 'Departments',
  program: 'Programs',
  faculty: 'Faculty',
};

const DEFAULT_ICONS: Record<QueueType, React.ReactNode> = {
  student: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  department: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polygon points="12 2 3 10 21 10" />
      <line x1="7" y1="21" x2="7" y2="10" />
      <line x1="12" y1="21" x2="12" y2="10" />
      <line x1="17" y1="21" x2="17" y2="10" />
    </svg>
  ),
  program: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  faculty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export function QueueMetricCard({
  queueType,
  title,
  count,
  actionLabel = 'Requires review',
  href,
  icon,
  onOpenQueue,
  className = '',
}: QueueMetricCardProps) {
  const resolvedTitle = title || DEFAULT_TITLES[queueType];
  const resolvedIcon = icon || DEFAULT_ICONS[queueType];

  return (
    <a
      href={href || `?queue=${queueType}`}
      data-queue-open={queueType}
      className={`ui-card ui-card-interactive ui-dashboard-metric ${className}`.trim()}
      onClick={(e) => {
        if (onOpenQueue) {
          e.preventDefault();
          onOpenQueue(queueType);
        }
      }}
    >
      <span className="ui-dashboard-metric-top">
        <span className="ui-card-title">{resolvedTitle}</span>
        <span className={`ui-dashboard-icon ui-dashboard-icon--${queueType}`} aria-hidden="true">
          {resolvedIcon}
        </span>
      </span>
      <span className="ui-dashboard-metric-bottom">
        <strong>{count}</strong>
        <span className="ui-text-muted ui-dashboard-metric-action">
          {actionLabel} <span className="arrow" aria-hidden="true">&rarr;</span>
        </span>
      </span>
    </a>
  );
}

export interface QueueMetricsGridProps {
  counts?: Partial<Record<QueueType, number>>;
  onOpenQueue?: (queueType: QueueType) => void;
  heading?: string;
}

export function QueueMetricsGrid({
  counts = { student: 4, department: 5, program: 5, faculty: 4 },
  onOpenQueue,
  heading = 'Pending Action Items',
}: QueueMetricsGridProps) {
  const items: { type: QueueType; count: number }[] = [
    { type: 'student', count: counts.student ?? 4 },
    { type: 'department', count: counts.department ?? 5 },
    { type: 'program', count: counts.program ?? 5 },
    { type: 'faculty', count: counts.faculty ?? 4 },
  ];

  return (
    <section className="ui-dashboard-overview" aria-labelledby="pending-items-heading">
      <h2 id="pending-items-heading">{heading}</h2>
      <div className="ui-dashboard-metrics">
        {items.map((item) => (
          <QueueMetricCard
            key={item.type}
            queueType={item.type}
            count={item.count}
            onOpenQueue={onOpenQueue}
          />
        ))}
      </div>
    </section>
  );
}

