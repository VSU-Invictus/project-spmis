import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'well' | 'interactive';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  className = '',
  children,
  ...props
}, ref) => {
  const variantClass = variant === 'subtle' 
    ? 'ui-card--subtle' 
    : variant === 'well' 
    ? 'ui-card--well' 
    : variant === 'interactive' 
    ? 'ui-card--interactive' 
    : '';

  return (
    <div
      ref={ref}
      className={`ui-card ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
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
  <p ref={ref} className={`ui-card-subtitle ${className}`.trim()} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div ref={ref} className={`ui-card-body ${className}`.trim()} {...props}>
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

