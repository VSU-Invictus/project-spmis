import React, { forwardRef, useId } from 'react';
import { Label } from './Label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hideLabel?: boolean;
  error?: boolean | string;
  helperText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  hideLabel = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  disabled,
  required,
  placeholder,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(error);
  const errorClass = hasError ? 'ui-input--error' : '';

  const resolvedAriaLabel =
    ariaLabel ||
    (!label && !ariaLabelledBy
      ? typeof placeholder === 'string' && placeholder.trim()
        ? placeholder.trim()
        : props.name || 'Text input'
      : undefined);

  const describedBy = [
    props['aria-describedby'],
    typeof error === 'string' && error ? errorId : undefined,
    helperText ? helperId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const computedInputStyle: React.CSSProperties = {
    ...(leftIcon ? { paddingLeft: '2.25rem' } : {}),
    ...(rightIcon ? { paddingRight: '2.25rem' } : {}),
    ...props.style,
  };

  const inputElement = (
    <input
      ref={ref}
      id={inputId}
      className={`ui-input ${leftIcon ? 'ui-input--with-left-icon' : ''} ${rightIcon ? 'ui-input--with-right-icon' : ''} ${errorClass} ${className}`.trim()}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      {...props}
      style={computedInputStyle}
    />
  );

  const controlNode = leftIcon || rightIcon ? (
    <div
      className={`ui-input-wrapper ${hasError ? 'ui-input-wrapper--error' : ''}`.trim()}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}
    >
      {leftIcon && (
        <span
          className="ui-input-icon ui-input-icon--left"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            pointerEvents: 'none',
            opacity: 0.65,
            color: 'var(--foreground)',
            zIndex: 1,
          }}
        >
          {leftIcon}
        </span>
      )}
      {inputElement}
      {rightIcon && (
        <span
          className="ui-input-icon ui-input-icon--right"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            pointerEvents: 'none',
            opacity: 0.65,
            color: 'var(--foreground)',
            zIndex: 1,
          }}
        >
          {rightIcon}
        </span>
      )}
    </div>
  ) : (
    inputElement
  );

  if (!label && !helperText && typeof error !== 'string') {
    return controlNode;
  }

  return (
    <div className="ui-form-group ui-field">
      {label && (
        <Label htmlFor={inputId} required={required} srOnly={hideLabel}>
          {label}
        </Label>
      )}
      {controlNode}
      {typeof error === 'string' && error && (
        <span id={errorId} className="ui-field-error" role="alert" style={{ color: 'var(--color-status-danger, #EF4444)', fontSize: 'var(--font-size-xs, 11px)' }}>
          {error}
        </span>
      )}
      {helperText && (
        <span id={helperId} className="ui-field-helper" style={{ color: 'var(--color-text-muted, #A0988E)', fontSize: 'var(--font-size-xs, 11px)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hideLabel?: boolean;
  error?: boolean | string;
  helperText?: React.ReactNode;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  minHeight?: number | string;
  maxHeight?: number | string;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  hideLabel = false,
  error,
  helperText,
  resize = 'vertical',
  minHeight = '88px',
  maxHeight,
  autoResize = false,
  className = '',
  id,
  disabled,
  required,
  placeholder,
  style,
  onChange,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;
  const hasError = Boolean(error);
  const errorClass = hasError ? 'ui-input--error ui-textarea--error' : '';

  const setCombinedRef = (node: HTMLTextAreaElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize && innerRef.current) {
      innerRef.current.style.height = 'auto';
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    }
    onChange?.(e);
  };

  const resolvedAriaLabel =
    ariaLabel ||
    (!label && !ariaLabelledBy
      ? typeof placeholder === 'string' && placeholder.trim()
        ? placeholder.trim()
        : props.name || 'Text area'
      : undefined);

  const describedBy = [
    props['aria-describedby'],
    typeof error === 'string' && error ? errorId : undefined,
    helperText ? helperId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const textareaElement = (
    <textarea
      ref={setCombinedRef}
      id={textareaId}
      className={`ui-input ui-textarea ${errorClass} ${className}`.trim()}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      onChange={handleChange}
      style={{
        resize,
        minHeight,
        maxHeight,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    />
  );

  if (!label && !helperText && typeof error !== 'string') {
    return textareaElement;
  }

  return (
    <div className="ui-form-group ui-field">
      {label && (
        <Label htmlFor={textareaId} required={required} srOnly={hideLabel}>
          {label}
        </Label>
      )}
      {textareaElement}
      {typeof error === 'string' && error && (
        <span id={errorId} className="ui-field-error" role="alert" style={{ color: 'var(--color-status-danger, #EF4444)', fontSize: 'var(--font-size-xs, 11px)' }}>
          {error}
        </span>
      )}
      {helperText && (
        <span id={helperId} className="ui-field-helper" style={{ color: 'var(--color-text-muted, #A0988E)', fontSize: 'var(--font-size-xs, 11px)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

