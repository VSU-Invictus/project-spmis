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
    id: 'f-1111-2222-3333-444444444444',
    role,
    status,
    email: 'faculty.test@example.edu',
    full_name: 'Test Faculty User',
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

describe('FacultyStudentsPage (#156)', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('renders student directory with multi-filter controls for active faculty', async () => {
    renderStudentsPage('faculty', 'active');

    expect(
      await screen.findByRole('heading', { name: /Student Directory & Review Mining/i })
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/Search name, ID, or review text/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by program/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by reviewer department/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Filter by competency tag/i })).toBeInTheDocument();

    // Verify initial student list loads
    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
  });

  it('blocks pending faculty from review mining tools with access alert', async () => {
    renderStudentsPage('faculty', 'pending');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search name, ID, or review text/i)).not.toBeInTheDocument();
  });

  it('blocks admin users from faculty review mining tools', async () => {
    renderStudentsPage('admin', 'active');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search name, ID, or review text/i)).not.toBeInTheDocument();
  });

  it('filters students by keyword query and preserves results', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search name, ID, or review text/i);
    await user.type(searchInput, 'Maria');

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  it('renders accessible .ui-empty-state on non-matching query with one-click filter reset', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search name, ID, or review text/i);
    await user.type(searchInput, 'NonExistentStudentXYZ999');

    // Accessible .ui-empty-state should render
    const emptyHeading = await screen.findByText(/No students matched your search/i);
    const emptyState = emptyHeading.closest('.ui-empty-state');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveAttribute('role', 'status');

    // One-click reset action
    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    expect(resetBtn).toBeInTheDocument();

    await user.click(resetBtn);

    // After reset, input is cleared and students re-appear
    expect(searchInput).toHaveValue('');
    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
  });

  it('filters students by competency tag dropdown', async () => {
    const user = userEvent.setup();
    renderStudentsPage('faculty', 'active');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();

    const tagSelect = screen.getByRole('combobox', { name: /Filter by competency tag/i });

    // Wait for tag suggestions to populate
    await waitFor(() => {
      expect(within(tagSelect).getByRole('option', { name: /#research/i })).toBeInTheDocument();
    });

    await user.selectOptions(tagSelect, 'research');

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });
});
