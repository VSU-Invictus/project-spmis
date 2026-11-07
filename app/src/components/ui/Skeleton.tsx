import React, { forwardRef } from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(({
  className = '',
  style,
  width,
  height,
  borderRadius = 'var(--radius-sm, 6px)',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`ui-skeleton animate-pulse ${className}`.trim()}
      style={{
        backgroundColor: 'var(--muted, #f1f5f9)',
        borderRadius,
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="ui-table-row animate-pulse">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="ui-table-cell" style={{ padding: '14px 16px' }}>
          <Skeleton height="18px" width={idx === 0 ? '70%' : '50%'} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div
      className="ui-card animate-pulse"
      style={{
        padding: '20px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md, 8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <Skeleton height="24px" width="40%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="16px" width="60%" />
    </div>
  );
}
