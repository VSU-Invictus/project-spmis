import React from 'react';

export interface FooterNavProps extends React.HTMLAttributes<HTMLElement> {
  aboutHref?: string;
  termsHref?: string;
  privacyHref?: string;
}

export function FooterNav({
  aboutHref = '/about',
  termsHref = '/terms',
  privacyHref = '/privacy-policy',
  className = '',
  ...props
}: FooterNavProps) {
  return (
    <nav className={`footer-nav ${className}`.trim()} aria-label="Footer navigation" {...props}>
      <a href={aboutHref}>About</a>
      <span className="dot" aria-hidden="true">•</span>
      <a href={termsHref}>Terms</a>
      <span className="dot" aria-hidden="true">•</span>
      <a href={privacyHref}>Privacy Policy</a>
    </nav>
  );
}

export interface PortalFooterProps extends React.HTMLAttributes<HTMLElement> {
  portalName?: string;
  version?: string;
  showLinks?: boolean;
}

export function PortalFooter({
  portalName = 'Admin Portal',
  version = '0.1.0',
  showLinks = false,
  className = '',
  ...props
}: PortalFooterProps) {
  return (
    <footer className={`admin-footer ui-dashboard-footer ${className}`.trim()} {...props}>
      <span>&copy; 2026 {portalName}. All rights reserved.</span>
      {showLinks && <FooterNav />}
      <span>System Version {version}</span>
    </footer>
  );
}

