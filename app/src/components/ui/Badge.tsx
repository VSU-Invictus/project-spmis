import React, { forwardRef } from 'react';

export type BadgeVariant =
  | 'addition'
  | 'edit-existing'
  | 'success'
  | 'warning'
  | 'danger'
  | 'destructive'
  | 'info'
  | 'neutral'
  | 'muted'
  | 'purple'
  | 'rose'
  | 'cyan'
  | 'amber'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  requestType?: 'Addition' | 'Edit Existing' | 'Edit' | string;
  dot?: boolean;
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'neutral',
  requestType,
  dot = false,
  icon,
  className = '',
  children,
  ...props
}, ref) => {
  let resolvedVariant = variant;
  let resolvedChildren = children;

  if (requestType) {
    if (requestType === 'Edit Existing' || requestType === 'Edit') {
      resolvedVariant = 'edit-existing';
      if (!resolvedChildren) resolvedChildren = 'Edit Existing';
    } else if (requestType === 'Addition') {
      resolvedVariant = 'addition';
      if (!resolvedChildren) resolvedChildren = 'Addition';
    }
  }

  const normVariant =
    resolvedVariant === 'destructive'
      ? 'danger'
      : resolvedVariant === 'addition'
      ? 'success'
      : resolvedVariant === 'edit-existing'
      ? 'info'
      : resolvedVariant;

  const variantClass = `ui-badge--${normVariant}`;
  const extraClass =
    resolvedVariant === 'destructive'
      ? 'ui-badge--destructive'
      : resolvedVariant === 'addition'
      ? 'ui-badge--addition'
      : resolvedVariant === 'edit-existing'
      ? 'ui-badge--edit-existing'
      : '';

  return (
    <span
      ref={ref}
      className={`ui-badge ${variantClass} ${extraClass} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className="ui-badge-dot"
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
            marginRight: '5px',
          }}
        />
      )}
      {icon && <span className="ui-badge-icon" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {resolvedChildren}
    </span>
  );
});

Badge.displayName = 'Badge';
