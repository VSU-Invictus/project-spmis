import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
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
  children: React.ReactNode;
}

export function AppShell({
  role = 'admin',
  activeNavKey = 'dashboard',
  onSelectNav,
  breadcrumb,
  academicYear = 'AY 2026-2027',
  children,
}: AppShellProps) {
  const navigate = useNavigate();
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
    <div className="app-canvas ui-dashboard-app" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {role === 'admin' ? (
        <AdminSidebar
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

      <main className="section-container ui-dashboard-main" style={{ flex: 1, minWidth: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '16px 24px', boxSizing: 'border-box' }}>
        <div className="admin-top-header ui-dashboard-top-header">
          <div className="header-left ui-dashboard-header-left">
            <span className="red-dot ui-dashboard-header-dot" aria-hidden="true" />
            <span className="breadcrumb-text ui-dashboard-breadcrumb">
              {breadcrumb || defaultBreadcrumb}
            </span>
          </div>
          <div className="header-right ui-dashboard-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggleButton />
            <span className="status-badge ui-dashboard-status">
              <span className="green-dot ui-dashboard-live-dot" aria-hidden="true" />
              System Live
            </span>
            <span className="ay-text ui-dashboard-academic-year">{academicYear}</span>
          </div>
        </div>

        <div className="ui-dashboard-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {children}
        </div>

        <PortalFooter
          portalName={role === 'admin' ? 'Admin Portal' : 'Faculty Portal'}
          showLinks
        />
      </main>

      <LogoutModal
        open={logoutOpen ? true : undefined}
        syncWithUrl
        role={role}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          navigate('/');
        }}
      />

      <QueueModalHost />
    </div>
  );
}

