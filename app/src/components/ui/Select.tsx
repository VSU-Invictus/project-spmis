import React, { forwardRef, useId } from 'react';
import { Label } from './Label';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  hideLabel?: boolean;
  error?: boolean;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  hideLabel = false,
  error,
  options,
  children,
  className = '',
  id,
  disabled,
  required,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorClass = error ? 'ui-input--error ui-select--error' : '';

  const resolvedAriaLabel =
    ariaLabel ||
    (!label && !ariaLabelledBy
      ? props.name || 'Select option'
      : undefined);

  const selectWrap = (
    <div
      className="ui-select-wrap"
      style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}
    >
      <select
        ref={ref}
        id={selectId}
        className={`ui-input ui-select ${errorClass} ${className}`.trim()}
        disabled={disabled}
        required={required}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledBy}
        {...props}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          paddingRight: '2.25rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ...props.style,
        }}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <svg
        className="ui-select-chevron"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '14px',
          height: '14px',
          pointerEvents: 'none',
          opacity: 0.65,
          color: 'var(--foreground)',
        }}
      >
        <path
          d="M3.5 5.25L7 8.75L10.5 5.25"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (!label) {
    return selectWrap;
  }

  return (
    <div className="ui-form-group ui-field">
      <Label htmlFor={selectId} required={required} srOnly={hideLabel}>
        {label}
      </Label>
      {selectWrap}
    </div>
  );
});

Select.displayName = 'Select';

