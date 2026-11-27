import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useSession } from '../../context/SessionContext';
import { QueueModalHost } from '../queue-modal/QueueModalHost';
import { AdminSidebar, type AdminNavKey } from './AdminSidebar';
import { FacultySidebar, type FacultyNavKey } from './FacultySidebar';
import { PortalFooter } from './FooterNav';
import { LogoutModal } from './LogoutModal';

export interface ThemeToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
}

export function ThemeToggleButton({ id, className = '', ...props }: ThemeToggleButtonProps) {
  const { toggleTheme, isDark } = useTheme();
  return (
    <button
      type="button"
      id={id}
      className={`ui-theme-toggle ${className}`.trim()}
      aria-label="Toggle theme"
      onClick={toggleTheme}
      {...props}
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}

export interface AppShellProps {
  role?: 'admin' | 'faculty';
  activeNavKey?: AdminNavKey | FacultyNavKey | string;
  onSelectNav?: (key: string) => void;
  breadcrumb?: string;
  academicYear?: string;
  showHeaderThemeToggle?: boolean;
  showFooterLinks?: boolean;
  mainClassName?: string;
  mobileNavigation?: React.ReactElement;
  children: React.ReactNode;
}

export function AppShell({
  role = 'admin',
  activeNavKey = 'dashboard',
  onSelectNav,
  breadcrumb,
  academicYear = 'AY 2026-2027',
  showHeaderThemeToggle = true,
  showFooterLinks,
  mainClassName = '',
  mobileNavigation,
  children,
}: AppShellProps) {
  const navigate = useNavigate();
  const { signOut } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const defaultBreadcrumb =
    role === 'admin' ? 'Admin Portal / Overview' : 'Faculty Portal / Overview';

  const handleSelectNav = (key: string) => {
    if (onSelectNav) {
      onSelectNav(key);
      return;
    }
    if (role === 'admin') {
      navigate(`/admin/${key}`);
    } else {
      navigate(`/faculty/${key}`);
    }
  };

  return (
    <div className={`app-canvas ui-dashboard-app ui-dashboard-app--${role}`} style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {role === 'admin' ? (
        <AdminSidebar
          className={mobileNavigation ? 'ui-dashboard-sidebar' : undefined}
          activeKey={activeNavKey as AdminNavKey}
          onSelectNav={handleSelectNav}
          onLogoutClick={() => setLogoutOpen(true)}
        />
      ) : (
        <FacultySidebar
          activeKey={activeNavKey as FacultyNavKey}
          onSelectNav={handleSelectNav}
          onLogoutClick={() => setLogoutOpen(true)}
        />
      )}

      <main className={`section-container ui-dashboard-main ${role === 'admin' ? 'admin-portal-main ' : ''}${mainClassName}`.trim()} style={{ flex: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '16px 24px', boxSizing: 'border-box' }}>
        <div className="admin-top-header ui-dashboard-top-header">
          <div className="header-left ui-dashboard-header-left">
            <span className="red-dot ui-dashboard-header-dot" aria-hidden="true" />
            <span className="breadcrumb-text ui-dashboard-breadcrumb">
              {breadcrumb || defaultBreadcrumb}
            </span>
          </div>
          <div className="header-right ui-dashboard-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showHeaderThemeToggle && <ThemeToggleButton />}
            <span className="status-badge ui-dashboard-status" role="status" aria-live="polite">
              <span className="green-dot ui-dashboard-live-dot" aria-hidden="true" />
              System Live
            </span>
            <span className="ay-text ui-dashboard-academic-year">{academicYear}</span>
          </div>
        </div>

        {mobileNavigation}
        <div className="ui-dashboard-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {children}
        </div>

        <PortalFooter
          portalName={role === 'admin' ? 'Admin Portal' : 'Faculty Portal'}
          showLinks={showFooterLinks}
        />
      </main>

      <LogoutModal
        open={logoutOpen ? true : undefined}
        syncWithUrl
        role={role}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={async () => {
          await signOut();
          setLogoutOpen(false);
          navigate('/signin', { replace: true });
        }}
      />

      {role === 'admin' && <QueueModalHost />}
    </div>
  );
}

