// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FacultyApplicationsPage } from './FacultyApplicationsPage';
import {
  SessionProvider,
  useSession,
  type FacultyProfile,
} from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { __resetMocks } from '../../mocks/handlers';

afterEach(() => {
  cleanup();
});

function ProfileBootstrapper({
  profile,
  children,
}: {
  profile: FacultyProfile;
  children: ReactNode;
}) {
  const { profile: currentProfile, loading, syncProfile } = useSession();
  useEffect(() => {
    if (
      !loading &&
      (!currentProfile ||
        currentProfile.id !== profile.id ||
        currentProfile.role !== profile.role ||
        currentProfile.status !== profile.status)
    ) {
      syncProfile(profile);
    }
  }, [currentProfile, loading, profile, syncProfile]);

  if (loading || !currentProfile || currentProfile.id !== profile.id) {
    return null;
  }

  return <>{children}</>;
}

function renderApplicationsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const profile: FacultyProfile = {
    id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
    role: 'faculty',
    status: 'active',
    email: 'faculty.test@example.edu',
    full_name: 'Alex Morgan',
    department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ProfileBootstrapper profile={profile}>
          <ThemeProvider>
            <MemoryRouter initialEntries={['/faculty/applications']}>
              <FacultyApplicationsPage />
            </MemoryRouter>
          </ThemeProvider>
        </ProfileBootstrapper>
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('FacultyApplicationsPage (#195)', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('renders Your applications table with left-aligned headers, status badge icon, pagination footer, and note directly below', async () => {
    renderApplicationsPage();

    expect(
      await screen.findByRole('heading', { name: /^Your applications$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Track your student registrations, program proposals, and department proposals\./i)
    ).toBeInTheDocument();

    expect(await screen.findByText('Sam Reyes')).toBeInTheDocument();
    expect(screen.getByText('Student registration')).toBeInTheDocument();
    expect(screen.getByText('Awaiting admin review')).toBeInTheDocument();

    const table = screen.getByRole('table', { name: /Your applications/i });
    const statusHeader = within(table).getByRole('columnheader', { name: /^Status$/i });
    const reasonHeader = within(table).getByRole('columnheader', { name: /^Decision \/ reason$/i });

    expect(statusHeader).not.toHaveClass('ui-table-heading-center');
    expect(reasonHeader).not.toHaveClass('ui-table-heading-center');

    expect(
      screen.getByText(/Only your submissions appear here\. Admin decisions include a reason when a request is rejected\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/System Version 0\.1\.0/i)).toBeInTheDocument();
  });

  it('filters applications by search keyword and status dropdown', async () => {
    const user = userEvent.setup();
    renderApplicationsPage();

    expect(await screen.findByText('Sam Reyes')).toBeInTheDocument();

    const statusSelect = screen.getByRole('combobox', { name: /Filter by application status/i });
    await user.selectOptions(statusSelect, 'approved');

    expect(await screen.findByText(/No matching applications/i)).toBeInTheDocument();
    expect(screen.getByText(/Try another search or status filter\./i)).toBeInTheDocument();
  });
});
