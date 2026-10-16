import React, { forwardRef, useEffect, useId, useRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  indeterminate?: boolean;
  isSelectAll?: boolean;
  isRowCheckbox?: boolean;
  keepSignedIn?: boolean;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  indeterminate = false,
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

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  const setCombinedRef = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if ( node ) {
      node.indeterminate = Boolean(indeterminate);
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
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
      ? isSelectAll || indeterminate
        ? 'Select all rows'
        : 'Select row'
      : undefined);

  const roleClass = [
    'custom-checkbox',
    isSelectAll || indeterminate ? 'select-all-checkbox' : '',
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
      onChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={resolvedAriaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-checked={indeterminate ? 'mixed' : checked}
      className={roleClass}
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
