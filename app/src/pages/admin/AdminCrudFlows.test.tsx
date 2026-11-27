// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AdminStudentsPage } from './AdminStudentsPage';
import { AdminFacultyPage } from './AdminFacultyPage';
import { SessionProvider, useSession, type FacultyProfile } from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { __resetMocks } from '../../mocks/handlers';
import { server } from '../../mocks/server';

const ADMIN_ID = 'b6f6d2fb-1536-4d80-8599-337eaa8ec3ab';
const CS_DEPARTMENT_ID = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  __resetMocks();
});

function AdminBootstrapper({ children }: { children: ReactNode }) {
  const { profile, loading, syncProfile } = useSession();
  useEffect(() => {
    if (!loading && profile?.id !== ADMIN_ID) {
      const adminProfile: FacultyProfile = {
        id: ADMIN_ID,
        role: 'admin',
        status: 'active',
        email: 'admin@example.edu',
        full_name: 'SPMIS Administrator',
        department_id: CS_DEPARTMENT_ID,
        created_at: '2026-10-26T00:00:00.000Z',
        updated_at: '2026-10-26T00:00:00.000Z',
      };
      syncProfile(adminProfile);
    }
  }, [loading, profile, syncProfile]);

  if (loading || profile?.id !== ADMIN_ID) return null;
  return <>{children}</>;
}

function renderAdminPage(page: ReactNode, initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AdminBootstrapper>
          <ThemeProvider>
            <MemoryRouter initialEntries={[initialEntry]}>{page}</MemoryRouter>
          </ThemeProvider>
        </AdminBootstrapper>
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe('Admin roster footers', () => {
  it('shows the M1 version label without legal links on the Student Roster', async () => {
    const { container } = renderAdminPage(<AdminStudentsPage />, '/admin/students');
    await screen.findByText('System Version 0.1.0');
    const footer = within(container.querySelector('footer')!);
    expect(footer.getByText('© 2026 Admin Portal. All rights reserved.')).toBeVisible();
    expect(footer.getByText('System Version 0.1.0')).toBeVisible();
    expect(footer.queryByRole('navigation', { name: 'Footer navigation' })).not.toBeInTheDocument();
  });

  it('shows the M1 version label without legal links on the Faculty Roster', async () => {
    const { container } = renderAdminPage(<AdminFacultyPage />, '/admin/faculty');
    await screen.findByText('System Version 0.1.0');
    const footer = within(container.querySelector('footer')!);
    expect(footer.getByText('© 2026 Admin Portal. All rights reserved.')).toBeVisible();
    expect(footer.getByText('System Version 0.1.0')).toBeVisible();
    expect(footer.queryByRole('navigation', { name: 'Footer navigation' })).not.toBeInTheDocument();
  });
});

describe('AdminStudentsPage delete flow (v1.1.0)', () => {
  it('deletes an unreferenced student and refreshes the roster', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminStudentsPage />, '/admin/students');

    const juanCell = await screen.findByText('Juan');
    const juanRow = juanCell.closest('[role="row"]');
    expect(juanRow).not.toBeNull();

    await user.click(within(juanRow as HTMLElement).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Student Removed Successfully')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Juan')).not.toBeInTheDocument();
    });
  });

  it('keeps the confirmation modal open and shows inline error on 409 conflict', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminStudentsPage />, '/admin/students');

    const mariaCell = await screen.findByText('Maria');
    const mariaRow = mariaCell.closest('[role="row"]');
    expect(mariaRow).not.toBeNull();

    await user.click(within(mariaRow as HTMLElement).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(
      await within(dialog).findByText(/Cannot delete a student profile that still has reviews/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('keeps the modal open and shows an error if DELETE returns 204 without removing the student', async () => {
    const user = userEvent.setup();
    server.use(
      http.delete('*/rest/v1/student_profiles', () => new HttpResponse(null, { status: 204 })),
    );
    renderAdminPage(<AdminStudentsPage />, '/admin/students');

    const juanCell = await screen.findByText('Juan');
    const juanRow = juanCell.closest('[role="row"]');
    expect(juanRow).not.toBeNull();

    await user.click(within(juanRow as HTMLElement).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(
      await within(dialog).findByText(/The student record could not be removed/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Student Removed Successfully')).not.toBeInTheDocument();
  });
});

describe('AdminFacultyPage create and delete flows (v1.1.0)', () => {
  it('creates a new faculty member with lowercase email normalization and refreshes the roster', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');

    expect(await screen.findByText('Alex Reyes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Faculty' }));
    const fullNameInput = await screen.findByLabelText('Full Name');
    const dialog = screen.getByRole('dialog');

    await user.type(fullNameInput, 'Dr. Jane Doe');
    await user.type(within(dialog).getByLabelText('Email Address'), 'Jane.Doe@Example.Edu');
    await user.selectOptions(within(dialog).getByLabelText('Department'), CS_DEPARTMENT_ID);
    await user.selectOptions(within(dialog).getByLabelText('Role'), 'faculty');

    await user.click(within(dialog).getByRole('button', { name: 'Add Faculty' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Faculty Created Successfully')).toBeInTheDocument();
    expect(await screen.findByText('Dr. Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.edu')).toBeInTheDocument();
  });

  it('shows inline 409 error and preserves inputs on duplicate faculty email', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');

    expect(await screen.findByText('Alex Reyes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Faculty' }));
    const fullNameInput = await screen.findByLabelText('Full Name');
    const dialog = screen.getByRole('dialog');

    await user.type(fullNameInput, 'Duplicate Alex');
    await user.type(within(dialog).getByLabelText('Email Address'), 'alex.reyes@example.edu');
    await user.selectOptions(within(dialog).getByLabelText('Department'), CS_DEPARTMENT_ID);
    await user.click(within(dialog).getByRole('button', { name: 'Add Faculty' }));

    expect(
      await within(dialog).findByText(/A faculty profile with that email address already exists/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Full Name')).toHaveValue('Duplicate Alex');
  });

  it('prevents self-deletion for the signed-in admin account', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');

    const adminRow = await waitFor(() => {
      const row = screen
        .getAllByText('SPMIS Administrator')
        .map((cell) => cell.closest('[role="row"]'))
        .find((r): r is HTMLElement => r !== null);
      expect(row).toBeDefined();
      return row!;
    });

    await user.click(within(adminRow).getByRole('button', { name: 'Remove' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(/You cannot remove your own active administrator account/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  it('deletes an unreferenced faculty member and shows inline 409 for one with reviews', async () => {
    const user = userEvent.setup();
    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');

    const pendingCell = await screen.findByText('Pending Faculty');
    const pendingRow = pendingCell.closest('[role="row"]');
    expect(pendingRow).not.toBeNull();

    await user.click(within(pendingRow as HTMLElement).getByRole('button', { name: 'Remove' }));
    let dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Faculty Removed Successfully')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Pending Faculty')).not.toBeInTheDocument();
    });

    const alexCell = await screen.findByText('Alex Reyes');
    const alexRow = alexCell.closest('[role="row"]');
    expect(alexRow).not.toBeNull();

    await user.click(within(alexRow as HTMLElement).getByRole('button', { name: 'Remove' }));
    dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(
      await within(dialog).findByText(/Cannot delete a faculty profile that still owns reviews/i),
    ).toBeInTheDocument();
  });

  it('keeps the modal open and shows an error if DELETE returns 204 without removing the faculty', async () => {
    const user = userEvent.setup();
    server.use(
      http.delete('*/rest/v1/faculty_profiles', () => new HttpResponse(null, { status: 204 })),
    );
    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');

    const pendingCell = await screen.findByText('Pending Faculty');
    const pendingRow = pendingCell.closest('[role="row"]');
    expect(pendingRow).not.toBeNull();

    await user.click(within(pendingRow as HTMLElement).getByRole('button', { name: 'Remove' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));

    expect(
      await within(dialog).findByText(/The faculty record could not be removed/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Faculty Removed Successfully')).not.toBeInTheDocument();
  });

  it('restricts Faculty creation department choices to approved departments and handles empty approved lists', async () => {
    const user = userEvent.setup();
    const mixedDepartments = [
      { id: CS_DEPARTMENT_ID, name: 'Computer Science', status: 'approved', proposed_by: null, created_at: '2026-10-26T00:00:00.000Z', updated_at: '2026-10-26T00:00:00.000Z' },
      { id: '11111111-1111-4111-8111-111111111112', name: 'Pending Robotics', status: 'pending', proposed_by: null, created_at: '2026-10-26T00:00:00.000Z', updated_at: '2026-10-26T00:00:00.000Z' },
      { id: '11111111-1111-4111-8111-111111111113', name: 'Rejected Alchemy', status: 'rejected', proposed_by: null, created_at: '2026-10-26T00:00:00.000Z', updated_at: '2026-10-26T00:00:00.000Z' },
    ];
    server.use(
      http.get('*/rest/v1/departments', ({ request }) => {
        const statusFilter = new URL(request.url).searchParams.get('status');
        return HttpResponse.json(
          statusFilter === 'eq.approved'
            ? mixedDepartments.filter((department) => department.status === 'approved')
            : mixedDepartments,
        );
      }),
    );

    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');
    expect(await screen.findByText('Alex Reyes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Faculty' }));
    const deptSelect = await screen.findByLabelText('Department');
    const dialog = screen.getByRole('dialog');
    expect(within(deptSelect).getByRole('option', { name: 'Computer Science' })).toBeInTheDocument();
    expect(within(deptSelect).queryByRole('option', { name: 'Pending Robotics' })).not.toBeInTheDocument();
    expect(within(deptSelect).queryByRole('option', { name: 'Rejected Alchemy' })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    cleanup();

    server.use(
      http.get('*/rest/v1/departments', ({ request }) => {
        const statusFilter = new URL(request.url).searchParams.get('status');
        return HttpResponse.json(
          statusFilter === 'eq.approved'
            ? []
            : mixedDepartments.filter((department) => department.status !== 'approved'),
        );
      }),
    );

    renderAdminPage(<AdminFacultyPage />, '/admin/faculty');
    expect(await screen.findByText('Alex Reyes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add Faculty' }));
    const emptyDialog = await screen.findByRole('dialog');
    expect(
      await within(emptyDialog).findByText(/No approved departments available/i),
    ).toBeInTheDocument();
    expect(within(emptyDialog).getByRole('button', { name: 'Add Faculty' })).toBeDisabled();
  });
});
