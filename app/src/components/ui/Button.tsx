import React, { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'add'
  | 'approve'
  | 'reject'
  | 'accept'
  | 'select-all'
  | 'empty-reset';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  hasSelection?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  hasSelection = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}, ref) => {
  const isPillAction =
    variant === 'approve' ||
    variant === 'reject' ||
    variant === 'accept' ||
    variant === 'select-all';

  let variantClass = '';
  if (isPillAction) {
    variantClass = `pill-btn ${variant} ${hasSelection ? 'has-selection' : ''}`.trim();
  } else if (variant === 'add') {
    variantClass = 'ui-btn add-button';
  } else if (variant === 'empty-reset') {
    variantClass = 'empty-state-btn';
  } else {
    variantClass = `ui-btn ui-btn--${variant} ui-btn-${variant}`;
  }

  const sizeClass = size !== 'md' ? `ui-btn--${size} ui-btn-${size}` : '';
  const resolvedLeftIcon = leftIcon !== undefined ? leftIcon : variant === 'add' ? <PlusIcon /> : null;

  return (
    <button
      ref={ref}
      type={type}
      className={`${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" aria-hidden="true" style={{ display: 'inline-flex', animation: 'spin 1s linear infinite' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </span>
      ) : resolvedLeftIcon ? (
        <span className="ui-btn-icon-left" style={{ display: 'inline-flex', alignItems: 'center' }}>{resolvedLeftIcon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && rightIcon && (
        <span className="ui-btn-icon-right" style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export interface ActionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  showArrow?: boolean;
}

export const ActionLink = forwardRef<HTMLAnchorElement, ActionLinkProps>(({
  showArrow = true,
  className = '',
  children,
  ...props
}, ref) => (
  <a
    ref={ref}
    className={`ui-link-neutral ${className}`.trim()}
    {...props}
  >
    {children} {showArrow && <span className="arrow">&rarr;</span>}
  </a>
));

ActionLink.displayName = 'ActionLink';

