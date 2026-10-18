import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';

export type CheckboxVariant = 'primary' | 'neutral' | 'no-orange';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  variant?: CheckboxVariant;
  indeterminate?: boolean;
  defaultIndeterminate?: boolean;
  onIndeterminateChange?: (indeterminate: boolean) => void;
  isSelectAll?: boolean;
  isRowCheckbox?: boolean;
  keepSignedIn?: boolean;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  variant = 'primary',
  indeterminate,
  defaultIndeterminate = false,
  onIndeterminateChange,
  isSelectAll = false,
  isRowCheckbox = false,
  keepSignedIn = false,
  description,
  className = '',
  id,
  checked,
  onChange,
  onKeyDown,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}, ref) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [internalIndeterminate, setInternalIndeterminate] = useState<boolean>(
    Boolean(indeterminate ?? defaultIndeterminate)
  );

  useEffect(() => {
    setInternalIndeterminate(Boolean(indeterminate));
  }, [indeterminate]);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = internalIndeterminate;
    }
  }, [internalIndeterminate, checked]);

  const setCombinedRef = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (node) {
      node.indeterminate = internalIndeterminate;
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (internalIndeterminate) {
      setInternalIndeterminate(false);
      if (innerRef.current) {
        innerRef.current.indeterminate = false;
      }
      onIndeterminateChange?.(false);
    }
    onChange?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && innerRef.current) {
      e.preventDefault();
      innerRef.current.click();
    }
    onKeyDown?.(e);
  };

  const resolvedAriaLabel =
    ariaLabel ||
    (!label && !ariaLabelledBy
      ? isSelectAll || internalIndeterminate
        ? 'Select all rows'
        : 'Select row'
      : undefined);

  const isNeutral = variant === 'neutral' || variant === 'no-orange';
  const roleClass = [
    'custom-checkbox',
    isNeutral ? 'custom-checkbox--neutral ui-checkbox--neutral' : '',
    isSelectAll || internalIndeterminate ? 'select-all-checkbox' : '',
    isRowCheckbox ? 'row-checkbox' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const checkboxElement = (
    <input
      type="checkbox"
      ref={setCombinedRef}
      id={checkboxId}
      checked={checked}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-checked={internalIndeterminate ? 'mixed' : checked}
      className={roleClass}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', ...props.style }}
      {...props}
    />
  );

  if (!label && !description) {
    return checkboxElement;
  }

  return (
    <label
      htmlFor={checkboxId}
      className={`ui-checkbox-label ${keepSignedIn ? 'keep-signed-in' : ''} ${disabled ? 'ui-checkbox-label--disabled' : ''}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
      }}
    >
      {checkboxElement}
      {keepSignedIn ? (
        <span className="keep-signed-in-text">{label}</span>
      ) : (
        <span className="ui-checkbox-content">
          {label && <span className="ui-checkbox-text">{label}</span>}
          {description && <small className="ui-checkbox-description">{description}</small>}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

