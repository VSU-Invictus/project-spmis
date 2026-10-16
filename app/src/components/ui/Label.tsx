import React, { forwardRef } from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  srOnly?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({
  children,
  className = '',
  required = false,
  srOnly = false,
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      className={`ui-label ${srOnly ? 'sr-only' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
      {required && (
        <span className="ui-label-required" aria-hidden="true" style={{ color: 'var(--color-status-danger, #EF4444)', marginLeft: '4px' }}>
          *
        </span>
      )}
    </label>
  );
});

Label.displayName = 'Label';

