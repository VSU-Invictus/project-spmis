import React, { forwardRef, useEffect, useRef, useState } from 'react';

const DEFAULT_MIN_SKELETON_MS =
  import.meta.env.MODE === 'test' ? 0 : 420;

/**
 * Holds a loading state true for at least `minDurationMs` whenever loading
 * runs so fast local/mock responses don't cause a 1-frame skeleton glitch.
 */
export function useMinimumLoadingDuration(
  isLoading: boolean,
  minDurationMs: number = DEFAULT_MIN_SKELETON_MS
): boolean {
  const [holdLoading, setHoldLoading] = useState(
    () => isLoading || minDurationMs > 0
  );
  const startTimeRef = useRef<number | null>(
    isLoading || minDurationMs > 0 ? Date.now() : null
  );

  useEffect(() => {
    if (minDurationMs <= 0) {
      setHoldLoading(isLoading);
      return;
    }

    if (isLoading) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      setHoldLoading(true);
      return;
    }

    if (startTimeRef.current === null) {
      setHoldLoading(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = minDurationMs - elapsed;

    if (remaining <= 0) {
      startTimeRef.current = null;
      setHoldLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      startTimeRef.current = null;
      setHoldLoading(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isLoading, minDurationMs]);

  return isLoading || holdLoading;
}

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
    <tr className="ui-table-row skeleton-row animate-pulse" aria-hidden="true">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="ui-table-cell" style={{ padding: '14px 16px' }}>
          <div
            className="skeleton"
            style={{ width: idx === 0 ? '72%' : idx === columns - 1 ? '55%' : '82%' }}
          />
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

