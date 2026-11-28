// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { FacultyTaxonomyPage } from './FacultyTaxonomyPage';
import { SessionProvider, useSession, type FacultyProfile } from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { __resetMocks } from '../../mocks/handlers';
import { server } from '../../mocks/server';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  __resetMocks();
});

function ProfileBootstrapper({ children }: { children: ReactNode }) {
  const { profile, loading, syncProfile } = useSession();
  const activeProfile: FacultyProfile = {
    id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
    role: 'faculty',
    status: 'active',
    email: 'faculty.test@example.edu',
    full_name: 'Alex Morgan',
    department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  useEffect(() => {
    if (!loading && profile?.id !== activeProfile.id) {
      syncProfile(activeProfile);
    }
  }, [loading, profile, syncProfile]);

  if (loading || profile?.id !== activeProfile.id) {
    return null;
  }

  return <>{children}</>;
}

function renderTaxonomyPage(mode: 'departments' | 'programs') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ProfileBootstrapper>
          <ThemeProvider>
            <MemoryRouter initialEntries={[`/faculty/${mode}`]}>
              <FacultyTaxonomyPage mode={mode} />
            </MemoryRouter>
          </ThemeProvider>
        </ProfileBootstrapper>
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('FacultyTaxonomyPage (#190)', () => {
  it('renders Approved badges with check icons, pagination count, and version footer on Departments', async () => {
    const { container } = renderTaxonomyPage('departments');

    expect(await screen.findByRole('heading', { name: /^Departments$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Propose Department/i })).toBeInTheDocument();
    expect(await screen.findByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();

    const approvedBadges = screen.getAllByText('Approved');
    expect(approvedBadges).toHaveLength(2);
    for (const badge of approvedBadges) {
      expect(badge).toHaveClass('ui-badge', 'ui-badge--success');
      const icon = badge.querySelector('svg.ui-icon');
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }

    expect(screen.getByText('Page 1 of 1 · 2 entries')).toBeInTheDocument();

    const footer = within(container.querySelector('footer')!);
    expect(footer.getByText('© 2026 Faculty Portal. All rights reserved.')).toBeVisible();
    expect(footer.getByText('System Version 0.1.0')).toBeVisible();
    expect(footer.queryByRole('navigation', { name: 'Footer navigation' })).not.toBeInTheDocument();
  });

  it('uses singular "1 entry" when search filters down to a single department and "0 entries" when empty', async () => {
    const user = userEvent.setup();
    renderTaxonomyPage('departments');

    expect(await screen.findByText('Computer Science')).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', { name: /Search by department name/i });
    await user.type(searchInput, 'Computer');

    expect(await screen.findByText('Page 1 of 1 · 1 entry')).toBeInTheDocument();
    expect(screen.queryByText(/1 entries/i)).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'NonexistentDepartmentXYZ');

    expect(await screen.findByText('0 entries')).toBeInTheDocument();
    expect(screen.getByText(/No matching departments/i)).toBeInTheDocument();
  });

  it('uses singular "1 entry" when API returns a single approved department', async () => {
    server.use(
      http.get('*/rest/v1/departments', () =>
        HttpResponse.json([
          {
            id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
            name: 'Computer Science',
            status: 'approved',
            proposed_by: null,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ])
      )
    );

    renderTaxonomyPage('departments');

    expect(await screen.findByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1 · 1 entry')).toBeInTheDocument();
    expect(screen.queryByText(/1 entries/i)).not.toBeInTheDocument();
  });

  it('renders Approved check icons and singular "1 entry" grammar on Programs as well', async () => {
    const user = userEvent.setup();
    renderTaxonomyPage('programs');

    expect(await screen.findByRole('heading', { name: /^Programs$/i })).toBeInTheDocument();
    expect(await screen.findByText('Bachelor of Science in Computer Science')).toBeInTheDocument();

    const approvedBadges = screen.getAllByText('Approved');
    expect(approvedBadges).toHaveLength(2);
    for (const badge of approvedBadges) {
      expect(badge.querySelector('svg.ui-icon')).not.toBeNull();
    }

    const searchInput = screen.getByRole('searchbox', { name: /Search by program name/i });
    await user.type(searchInput, 'Computer');

    expect(await screen.findByText('Page 1 of 1 · 1 entry')).toBeInTheDocument();
  });
});
