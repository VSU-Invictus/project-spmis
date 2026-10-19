import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'well' | 'interactive' | 'sm';
  isLoading?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  isLoading = false,
  className = '',
  children,
  ...props
}, ref) => {
  const variantClass = variant === 'subtle' 
    ? 'ui-card--subtle' 
    : variant === 'well' 
    ? 'ui-card--well' 
    : variant === 'interactive' 
    ? 'ui-card-interactive' 
    : variant === 'sm'
    ? 'ui-card-sm metric-card'
    : '';

  return (
    <div
      ref={ref}
      className={`ui-card ${variantClass} ${isLoading ? 'ui-card--loading' : ''} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      {children}
      {isLoading && (
        <div className="ui-loading-placeholder" aria-hidden="true">
          <span className="ui-skeleton ui-skeleton--title"></span>
          <span className="ui-skeleton ui-skeleton--short"></span>
          <div className="ui-loading-lines">
            <span className="ui-skeleton"></span>
            <span className="ui-skeleton"></span>
            <span className="ui-skeleton ui-skeleton--short"></span>
          </div>
          <span className="ui-skeleton ui-skeleton--short"></span>
        </div>
      )}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`ui-card-header ${className}`.trim()} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <h3 ref={ref} className={`ui-card-title ${className}`.trim()} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <p ref={ref} className={`ui-card-description ${className}`.trim()} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`ui-card-content ${className}`.trim()} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`ui-card-footer ${className}`.trim()} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export interface KpiMetricCardProps {
  label: string;
  value: string | number;
  trend?: string;
  status?: string;
  description?: string;
  isLoading?: boolean;
}

export function KpiMetricCard({
  label,
  value,
  trend,
  status,
  description,
  isLoading = false,
}: KpiMetricCardProps) {
  return (
    <div className={`ui-card ui-card-sm metric-card ${isLoading ? 'ui-card--loading' : ''}`} aria-busy={isLoading}>
      <div className="ui-card-header" style={{ marginBottom: '0.5rem' }}>
        <p className="metric-card-label">{label}</p>
      </div>
      <div className="metric-card-row">
        <strong className="metric-card-value">{value}</strong>
        {trend && <span className="metric-card-trend">{trend}</span>}
      </div>
      {status && <p className="metric-card-status">{status}</p>}
      {description && <p className="ui-card-description">{description}</p>}
      <div className="ui-loading-placeholder" aria-hidden="true">
        <span className="ui-skeleton ui-skeleton--title"></span>
        <div className="ui-loading-row">
          <span className="ui-skeleton ui-skeleton--metric"></span>
          <span className="ui-skeleton ui-skeleton--badge"></span>
        </div>
        <span className="ui-skeleton ui-skeleton--short"></span>
        <span className="ui-skeleton"></span>
      </div>
    </div>
  );
}

export interface InteractiveLinkCardProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title: string;
  badgeText?: string;
  description?: React.ReactNode;
  bodyText?: React.ReactNode;
  footerText?: string;
  isLoading?: boolean;
}

export function InteractiveLinkCard({
  title,
  badgeText = 'Link',
  description,
  bodyText,
  footerText = 'Explore workspace',
  isLoading = false,
  className = '',
  href = '#interactive-target',
  ...props
}: InteractiveLinkCardProps) {
  return (
    <a
      href={href}
      className={`ui-card ui-card-interactive ${isLoading ? 'ui-card--loading' : ''} ${className}`.trim()}
      aria-busy={isLoading}
      {...props}
    >
      <div className="ui-card-header">
        <div className="ui-card-header-top">
          <h3 className="ui-card-title">{title}</h3>
          <span className="ui-card-action-link ui-link-neutral">
            {badgeText} <span className="arrow" aria-hidden="true">&rarr;</span>
          </span>
        </div>
        {description && <p className="ui-card-description" style={{ marginTop: '8px' }}>{description}</p>}
      </div>
      {bodyText && (
        <div className="ui-card-content">
          <p className="ui-text">{bodyText}</p>
        </div>
      )}
      <div className="ui-card-footer">
        <span className="ui-card-action-link ui-link-neutral">
          {footerText} <span className="arrow" aria-hidden="true">&rarr;</span>
        </span>
      </div>
      <div className="ui-loading-placeholder" aria-hidden="true">
        <div className="ui-loading-row">
          <span className="ui-skeleton ui-skeleton--title"></span>
          <span className="ui-skeleton ui-skeleton--badge"></span>
        </div>
        <span className="ui-skeleton ui-skeleton--short"></span>
        <div className="ui-loading-lines">
          <span className="ui-skeleton"></span>
          <span className="ui-skeleton"></span>
          <span className="ui-skeleton ui-skeleton--short"></span>
        </div>
        <span className="ui-skeleton ui-skeleton--short"></span>
      </div>
    </a>
  );
}


