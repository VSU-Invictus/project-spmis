import React from 'react';

export interface ColorSwatchCardProps {
  name: string;
  variable: string;
  role: string;
  swatchClassName?: string;
  swatchColor?: string;
}

export function ColorSwatchCard({
  name,
  variable,
  role,
  swatchClassName = '',
  swatchColor,
}: ColorSwatchCardProps) {
  return (
    <div className="ui-color-card">
      <div
        className={`ui-color-swatch ${swatchClassName}`.trim()}
        style={swatchColor ? { backgroundColor: swatchColor } : undefined}
      />
      <div className="ui-color-info">
        <span className="ui-color-name">{name}</span>
        <span className="ui-color-var">{variable}</span>
        <span className="ui-color-role">{role}</span>
      </div>
    </div>
  );
}

export interface TypographyHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: React.ElementType;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  isLoading?: boolean;
}

export function TypographyHeading({
  as,
  level = 1,
  isLoading = false,
  className = '',
  children,
  ...props
}: TypographyHeadingProps) {
  const Tag = as || ((`h${level}` as unknown) as React.ElementType);
  return (
    <Tag
      className={`ui-heading-${level} ${isLoading ? 'ui-text--loading' : ''} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      <span className="ui-text-loading-content">{children}</span>
      {isLoading && (
        <span className="ui-text-loading-placeholder" aria-hidden="true">
          <span className="ui-skeleton ui-skeleton--text-line" />
        </span>
      )}
    </Tag>
  );
}

export interface TypographyTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: 'default' | 'muted' | 'caption' | 'mono' | 'number' | 'label';
  isLoading?: boolean;
  skeletonLines?: number;
}

export function TypographyText({
  as,
  variant = 'default',
  isLoading = false,
  skeletonLines = 1,
  className = '',
  children,
  ...props
}: TypographyTextProps) {
  const baseClass =
    variant === 'muted'
      ? 'ui-text-muted'
      : variant === 'caption'
      ? 'ui-text-caption'
      : variant === 'mono'
      ? 'ui-text-mono'
      : variant === 'number'
      ? 'ui-text-number ui-font-number'
      : variant === 'label'
      ? 'ui-btn-label'
      : 'ui-text';

  const defaultTag = (variant === 'label' ? 'span' : 'p') as React.ElementType;
  const Tag = as || defaultTag;

  return (
    <Tag
      className={`${baseClass} ${isLoading ? 'ui-text--loading' : ''} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      <span className="ui-text-loading-content">{children}</span>
      {isLoading && (
        <span className="ui-text-loading-placeholder" aria-hidden="true">
          {Array.from({ length: skeletonLines }).map((_, idx) => (
            <span key={idx} className="ui-skeleton ui-skeleton--text-line" />
          ))}
        </span>
      )}
    </Tag>
  );
}

export interface TypographyNumberProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  isLoading?: boolean;
}

export function TypographyNumber({
  as: Component = 'span',
  isLoading = false,
  className = '',
  children,
  ...props
}: TypographyNumberProps) {
  return (
    <Component
      className={`ui-font-number ui-text-number ${isLoading ? 'ui-text--loading' : ''} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      <span className="ui-text-loading-content">{children}</span>
      {isLoading && (
        <span className="ui-text-loading-placeholder" aria-hidden="true">
          <span className="ui-skeleton ui-skeleton--text-line" />
        </span>
      )}
    </Component>
  );
}

