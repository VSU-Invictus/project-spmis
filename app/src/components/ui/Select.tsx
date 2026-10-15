import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  error,
  options,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const errorClass = error ? 'ui-select--error' : '';

  return (
    <div className="ui-select-wrap">
      <select
        ref={ref}
        className={`ui-select ${errorClass} ${className}`.trim()}
        disabled={disabled}
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
});

Select.displayName = 'Select';

