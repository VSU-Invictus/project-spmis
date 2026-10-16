import React, { forwardRef } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'approve'
  | 'reject'
  | 'select-all';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  hasSelection?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

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
  const isPillAction = variant === 'approve' || variant === 'reject' || variant === 'select-all';

  const variantClass = isPillAction
    ? `pill-btn ${variant} ${hasSelection ? 'has-selection' : ''}`.trim()
    : `ui-btn ui-btn--${variant} ui-btn-${variant}`;

  const sizeClass = size !== 'md' ? `ui-btn--${size} ui-btn-${size}` : '';

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
      ) : leftIcon ? (
        <span className="ui-btn-icon-left" style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!isLoading && rightIcon && (
        <span className="ui-btn-icon-right" style={{ display: 'inline-flex', alignItems: 'center' }}>{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
