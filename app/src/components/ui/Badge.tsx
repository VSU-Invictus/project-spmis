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

export interface TagClusterItem {
  label: string;
  variant?: BadgeVariant;
}

export interface TagClusterProps {
  tags: TagClusterItem[];
  maxVisible?: number;
}

export function TagCluster({ tags, maxVisible = 2 }: TagClusterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const visibleTags = tags.slice(0, maxVisible);
  const extraTags = tags.slice(maxVisible);

  return (
    <div className="ui-tags-cluster">
      {visibleTags.map((t, idx) => (
        <Badge key={idx} variant={t.variant || 'neutral'}>
          {t.label}
        </Badge>
      ))}
      {extraTags.length > 0 && (
        <div
          ref={popoverRef}
          className={`ui-tags-more ${isOpen ? 'is-open' : ''}`}
          tabIndex={0}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`${extraTags.length} more tags`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          <Badge variant="neutral" className="ui-tags-more-btn">
            +{extraTags.length}
          </Badge>
          <div className="ui-tags-popover" role="tooltip">
            <div className="ui-tags-popover-title">Additional Tags ({extraTags.length})</div>
            <div className="ui-tags-popover-list">
              {extraTags.map((t, idx) => (
                <Badge key={idx} variant={t.variant || 'neutral'}>
                  {t.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

