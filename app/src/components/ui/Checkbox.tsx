import React, { forwardRef, useEffect, useRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  indeterminate = false,
  description,
  className = '',
  id,
  checked,
  onChange,
  disabled,
  ...props
}, ref) => {
  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = (ref && 'current' in ref ? ref.current : innerRef.current);
    if (el) {
      el.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate, ref]);

  const setCombinedRef = (node: HTMLInputElement | null) => {
    (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const checkboxElement = (
    <input
      type="checkbox"
      ref={setCombinedRef}
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`custom-checkbox ${indeterminate ? 'select-all-checkbox' : ''} ${className}`.trim()}
      {...props}
    />
  );

  if (!label && !description) {
    return checkboxElement;
  }

  return (
    <label htmlFor={id} className={`ui-checkbox-label ${disabled ? 'ui-checkbox-label--disabled' : ''}`}>
      {checkboxElement}
      <span className="ui-checkbox-content">
        {label && <span className="ui-checkbox-text">{label}</span>}
        {description && <small className="ui-checkbox-description">{description}</small>}
      </span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

