import React, { forwardRef } from 'react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  hidden?: boolean;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({
  title = 'No pending applications',
  description = 'Applications awaiting review will appear here.',
  icon,
  action,
  hidden = false,
  className = '',
  ...props
}, ref) => {
  if (hidden) return null;

  return (
    <div
      ref={ref}
      className={`ui-empty-state ${className}`.trim()}
      role="status"
      aria-live="polite"
      {...props}
    >
      {icon && (
        <div className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="ui-empty-state__title" data-empty-title>
        {title}
      </h2>
      <p className="ui-empty-state__description" data-empty-description>
        {description}
      </p>
      {action && <div className="ui-empty-state__actions">{action}</div>}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

