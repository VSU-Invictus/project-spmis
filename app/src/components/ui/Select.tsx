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
  const errorClass = error ? 'ui-select--error' : '';

  const resolvedAriaLabel =
    ariaLabel ||
    (!label && !ariaLabelledBy
      ? props.name || 'Select option'
      : undefined);

  const selectWrap = (
    <div className="ui-select-wrap">
      <select
        ref={ref}
        id={selectId}
        className={`ui-select ${errorClass} ${className}`.trim()}
        disabled={disabled}
        required={required}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledBy}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    </div>
  );

  if (!label) {
    return selectWrap;
  }

  return (
    <div className="ui-field">
      <Label htmlFor={selectId} required={required} srOnly={hideLabel}>
        {label}
      </Label>
      {selectWrap}
    </div>
  );
});

Select.displayName = 'Select';
