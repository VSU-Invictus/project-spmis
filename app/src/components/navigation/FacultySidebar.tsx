import React, { useRef, useState } from 'react';
import { LogoutModal } from './LogoutModal';

export type FacultyNavKey =
  | 'dashboard'
  | 'students'
  | 'chat'
  | 'programs'
  | 'departments'
  | 'applications';

export interface FacultyNavItem {
  key: FacultyNavKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const FACULTY_NAV_ITEMS: FacultyNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/faculty/dashboard',
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
    href: '/faculty/students',
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
    key: 'chat',
    label: 'AI Chat Assistant',
    href: '/faculty/chat',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2V11.5a9.5 9.5 0 0 1 19 0Z" />
        <path d="m12 6 1.3 3.7L17 11l-3.7 1.3L12 16l-1.3-3.7L7 11l3.7-1.3Z" />
      </svg>
    ),
  },
  {
    key: 'programs',
    label: 'Programs',
    href: '/faculty/programs',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: 'departments',
    label: 'Departments',
    href: '/faculty/departments',
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
    key: 'applications',
    label: 'Applications',
    href: '/faculty/applications',
    icon: (
      <svg className="w-[18px] h-[18px] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14h6" />
        <path d="M9 18h6" />
        <path d="M9 10h.01" />
      </svg>
    ),
  },
];

export interface FacultySidebarProps {
  activeKey?: FacultyNavKey | string;
  onSelectNav?: (key: FacultyNavKey) => void;
  userName?: string;
  userRole?: string;
  userInitial?: string;
  embedded?: boolean;
  onLogoutClick?: () => void;
  onLogoutConfirm?: () => void;
  className?: string;
}

export function FacultySidebar({
  activeKey: controlledActiveKey,
  onSelectNav,
  userName = 'Alex Morgan',
  userRole = 'Faculty member',
  userInitial = 'A',
  embedded = false,
  onLogoutClick,
  onLogoutConfirm,
  className = '',
}: FacultySidebarProps) {
  const [internalActiveKey, setInternalActiveKey] = useState<FacultyNavKey>('dashboard');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);

  const currentActiveKey = controlledActiveKey ?? internalActiveKey;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: FacultyNavItem) => {
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

  return (
    <>
      <aside
        id={embedded ? undefined : 'sidebar-menu'}
        data-component="sidebar-faculty"
        className={`app-sidebar sidebar select-none flex flex-col justify-between p-4 overflow-y-auto dark-scrollbar z-50 ${className}`.trim()}
        style={{
          width: '260px',
          minWidth: '260px',
          maxWidth: '260px',
          height: embedded ? '500px' : '100vh',
          borderRadius: embedded ? '16px' : 0,
          backgroundColor: 'var(--sidebar)',
          border: embedded ? '1px solid var(--border)' : undefined,
          borderRight: embedded ? undefined : '1px solid var(--sidebar-border)',
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
              Faculty Portal
            </h1>
          </div>

          <nav className="nav" aria-label="Faculty navigation" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {FACULTY_NAV_ITEMS.map((item) => {
              const isActive = currentActiveKey === item.key;
              return (
                <a
                  key={item.key}
                  href={embedded ? `#${item.key}` : item.href}
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
                <span className="sidebar-account-name" data-name style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 700, lineHeight: 1.2 }}>
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
          role="faculty"
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

