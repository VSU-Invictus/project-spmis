import React, { forwardRef } from 'react';

export type BadgeVariant =
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
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'neutral',
  dot = false,
  className = '',
  children,
  ...props
}, ref) => {
  const normVariant = variant === 'destructive' ? 'danger' : variant;
  const variantClass = `ui-badge--${normVariant}`;

  return (
    <span
      ref={ref}
      className={`ui-badge ${variantClass} ${className}`.trim()}
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
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

