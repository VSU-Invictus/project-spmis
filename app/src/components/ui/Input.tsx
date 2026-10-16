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

  const inputElement = (
    <input
      ref={ref}
      id={inputId}
      className={`ui-input ${errorClass} ${className}`.trim()}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      {...props}
    />
  );

  const controlNode = leftIcon || rightIcon ? (
    <div className={`ui-input-wrapper ${hasError ? 'ui-input-wrapper--error' : ''}`}>
      {leftIcon && <span className="ui-input-icon ui-input-icon--left" aria-hidden="true">{leftIcon}</span>}
      {inputElement}
      {rightIcon && <span className="ui-input-icon ui-input-icon--right" aria-hidden="true">{rightIcon}</span>}
    </div>
  ) : (
    inputElement
  );

  if (!label && !helperText && typeof error !== 'string') {
    return controlNode;
  }

  return (
    <div className="ui-field">
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
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  hideLabel = false,
  error,
  helperText,
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
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;
  const hasError = Boolean(error);
  const errorClass = hasError ? 'ui-textarea--error' : '';

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
      ref={ref}
      id={textareaId}
      className={`ui-textarea ${errorClass} ${className}`.trim()}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      {...props}
    />
  );

  if (!label && !helperText && typeof error !== 'string') {
    return textareaElement;
  }

  return (
    <div className="ui-field">
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
