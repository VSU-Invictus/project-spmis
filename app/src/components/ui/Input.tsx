import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const errorClass = hasError ? 'ui-input--error' : '';

  if (leftIcon || rightIcon) {
    return (
      <div className={`ui-input-wrapper ${hasError ? 'ui-input-wrapper--error' : ''}`}>
        {leftIcon && <span className="ui-input-icon ui-input-icon--left">{leftIcon}</span>}
        <input
          ref={ref}
          className={`ui-input ${errorClass} ${className}`.trim()}
          disabled={disabled}
          {...props}
        />
        {rightIcon && <span className="ui-input-icon ui-input-icon--right">{rightIcon}</span>}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={`ui-input ${errorClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

