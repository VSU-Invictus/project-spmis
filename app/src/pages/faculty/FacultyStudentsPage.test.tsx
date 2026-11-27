// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FacultyStudentsPage } from './FacultyStudentsPage';
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

function renderStudentsPage(
  role: 'faculty' | 'admin' = 'faculty',
  status: 'active' | 'pending' = 'active'
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const profile: FacultyProfile = {
    id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
    role,
    status,
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
            <MemoryRouter initialEntries={['/faculty/students']}>
              <FacultyStudentsPage />
            </MemoryRouter>
          </ThemeProvider>
        </ProfileBootstrapper>
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('FacultyStudentsPage (#156 & #188)', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('renders Students layout, filters, short program name, colored tags, Write review action, and pagination footer for active faculty', async () => {
    renderStudentsPage('faculty', 'active');

    expect(
      await screen.findByRole('heading', { name: /^Students$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Browse students and search the text of active reviews\./i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Search by student name or keyword/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by department/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by review tag/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by faculty contributor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();

    // Verify initial student list loads with short program name, colored tag pills, and Write review link
    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getAllByText('BS Computer Science').length).toBeGreaterThan(0);
    expect(screen.getByText('No active reviews')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Write review/i }).length).toBeGreaterThan(0);

    // Verify pagination footer
    expect(screen.getByRole('combobox', { name: /Rows per page/i })).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1 · 2 entries/i)).toBeInTheDocument();
    expect(screen.getByText(/System Version 0\.1\.0/i)).toBeInTheDocument();
  });

  it('blocks pending faculty from review mining tools with access alert', async () => {
    renderStudentsPage('faculty', 'pending');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search by student name or keyword/i)).not.toBeInTheDocument();
  });

  it('blocks admin users from faculty review mining tools', async () => {
    renderStudentsPage('admin', 'active');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search by student name or keyword/i)).not.toBeInTheDocument();
  });

  it('filters students by keyword query and preserves results', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by student name or keyword/i);
    await user.type(searchInput, 'Maria');

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.queryByText('Juan Dela Cruz')).not.toBeInTheDocument();
    });
  });

  it('renders accessible .ui-empty-state on non-matching query with one-click filter reset', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by student name or keyword/i);
    await user.type(searchInput, 'NonExistentStudentXYZ999');

    // Accessible .ui-empty-state should render
    const emptyHeading = await screen.findByText(/No matching students/i);
    const emptyState = emptyHeading.closest('.ui-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveAttribute('role', 'status');

    // One-click reset action
    const resetButtons = screen.getAllByRole('button', { name: /Clear filters/i });
    await user.click(resetButtons[resetButtons.length - 1]);

    // After reset, input is cleared and students re-appear
    expect(searchInput).toHaveValue('');
    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
  });

  it('filters students by review tag dropdown', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const tagSelect = screen.getByRole('combobox', { name: /Filter by review tag/i });

    // Wait for tag suggestions to populate
    await waitFor(() => {
      expect(within(tagSelect).getByRole('option', { name: /^research$/i })).toBeInTheDocument();
    });

    await user.selectOptions(tagSelect, 'research');

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.queryByText('Juan Dela Cruz')).not.toBeInTheDocument();
    });
  });
});
