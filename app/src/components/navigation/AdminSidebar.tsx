import React, { useRef, useState } from 'react';
import { LogoutModal } from './LogoutModal';

export type AdminNavKey =
  | 'dashboard'
  | 'students'
  | 'departments'
  | 'programs'
  | 'faculty'
  | 'audit-log';

export interface AdminNavItem {
  key: AdminNavKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5" />
        <rect x="11" y="11" width="6.5" height="6.5" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'students',
    label: 'Students',
    href: '/admin/students',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'departments',
    label: 'Departments',
    href: '/admin/departments',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <polygon points="12 2 3 10 21 10" />
        <line x1="7" y1="21" x2="7" y2="10" />
        <line x1="12" y1="21" x2="12" y2="10" />
        <line x1="17" y1="21" x2="17" y2="10" />
      </svg>
    ),
  },
  {
    key: 'programs',
    label: 'Programs',
    href: '/admin/programs',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: 'faculty',
    label: 'Faculty',
    href: '/admin/faculty',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: 'audit-log',
    label: 'Audit Log',
    href: '/admin/audit-log',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export interface AdminSidebarProps {
  activeKey?: AdminNavKey | string;
  onSelectNav?: (key: AdminNavKey) => void;
  userName?: string;
  userRole?: string;
  userInitial?: string;
  embedded?: boolean;
  onLogoutClick?: () => void;
  onLogoutConfirm?: () => void;
  className?: string;
}

export function AdminSidebar({
  activeKey: controlledActiveKey,
  onSelectNav,
  userName = 'Admin User',
  userRole = 'System Admin',
  userInitial = 'A',
  embedded = false,
  onLogoutClick,
  onLogoutConfirm,
  className = '',
}: AdminSidebarProps) {
  const [internalActiveKey, setInternalActiveKey] = useState<AdminNavKey>('dashboard');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);

  const currentActiveKey = controlledActiveKey ?? internalActiveKey;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: AdminNavItem) => {
    if (onSelectNav || embedded) {
      e.preventDefault();
      setInternalActiveKey(item.key);
      onSelectNav?.(item.key);
    }
  };

  const handleLogoutTrigger = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      setLogoutOpen(true);
    }
  };

  if (embedded) {
    return (
      <>
        <div className={`is-5d36f48 ${className}`.trim()} id="demo-sidebar-container">
          <div className="is-f235cd8">
            <div className="is-e3594a7">
              <span className="brand-title is-2a3fc95">Admin Portal</span>
            </div>

            <nav className="is-614e369" id="demo-sidebar-nav" aria-label="Admin navigation">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = currentActiveKey === item.key;
                return (
                  <a
                    key={item.key}
                    href={`#${item.key}`}
                    data-nav-key={item.key}
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? 'nav-btn-active' : 'nav-btn-inactive'}
                    onClick={(e) => handleNavClick(e, item)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="is-3df200c">
            <div className="account-divider is-612e475"></div>
            <div className="account-box is-05cc564">
              <div className="is-63c3252">
                <div className="is-39f9a79">{userInitial}</div>
                <div className="is-614e369">
                  <span className="account-name is-8b9eb77">{userName}</span>
                  <span className="account-role is-b28f1f4">{userRole}</span>
                </div>
              </div>
              <button
                ref={logoutBtnRef}
                type="button"
                aria-label="Log out"
                title="Log out"
                className="ui-sidebar-logout sidebar-logout-btn logout-btn is-3b8f7f7"
                onClick={handleLogoutTrigger}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {!onLogoutClick && (
          <LogoutModal
            open={logoutOpen}
            role="admin"
            onCancel={() => {
              setLogoutOpen(false);
              logoutBtnRef.current?.focus();
            }}
            onConfirm={() => {
              setLogoutOpen(false);
              onLogoutConfirm?.();
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <aside
        id="sidebar-menu"
        className={`app-sidebar w-[260px] h-screen bg-sidebar border-r border-sidebar-right select-none flex flex-col justify-between p-4 overflow-y-auto dark-scrollbar z-50 ${className}`.trim()}
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100vh',
          backgroundColor: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '4px 8px 0', marginBottom: '8px' }}>
            <h1 className="brand-title" style={{ fontWeight: 800, fontSize: '20px', lineHeight: '26px', color: 'var(--foreground)', margin: 0 }}>
              Admin Portal
            </h1>
          </div>

          <nav className="nav" id="sidebar-nav" aria-label="Admin navigation" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = currentActiveKey === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  data-nav-key={item.key}
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? 'nav-btn-active' : 'nav-btn-inactive'}
                  style={{
                    minHeight: '40px',
                    padding: '0 14px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 600,
                    backgroundColor: isActive ? '#D97251' : 'transparent',
                    color: isActive ? '#000000' : 'var(--sidebar-foreground)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={(e) => handleNavClick(e, item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="sidebar-divider" style={{ height: '1px', width: '100%', borderBottom: '1px solid var(--border)' }} />

          <div
            className="sidebar-account-card"
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '18px',
              height: '58px',
              width: '100%',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="sidebar-avatar"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-avatar-bg)',
                  color: 'var(--color-avatar-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '17px',
                }}
              >
                <span>{userInitial}</span>
              </div>

              <div className="sidebar-account-details" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="sidebar-account-name" style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
                  {userName}
                </span>
                <span className="sidebar-account-role" style={{ color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 500, lineHeight: 1.2 }}>
                  {userRole}
                </span>
              </div>
            </div>

            <button
              ref={logoutBtnRef}
              type="button"
              className="ui-sidebar-logout sidebar-logout-btn logout-btn"
              aria-label="Log out"
              title="Log out"
              onClick={handleLogoutTrigger}
              style={{
                color: 'var(--muted-foreground)',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {!onLogoutClick && (
        <LogoutModal
          open={logoutOpen}
          role="admin"
          onCancel={() => {
            setLogoutOpen(false);
            logoutBtnRef.current?.focus();
          }}
          onConfirm={() => {
            setLogoutOpen(false);
            onLogoutConfirm?.();
          }}
        />
      )}
    </>
  );
}

