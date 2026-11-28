// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FacultyDashboardPage } from './FacultyDashboardPage';
import { SessionProvider, useSession, type FacultyProfile } from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';

const hookCalls = vi.hoisted(() => ({ reviewQueries: [] as Array<{ params: Record<string, string> | undefined; enabled: boolean }> }));

vi.mock('../../hooks/useStudentReviews', () => ({
  useStudentReviews: (params: Record<string, string> | undefined, options?: { enabled?: boolean }) => {
    hookCalls.reviewQueries.push({ params, enabled: options?.enabled ?? true });
    return {
      data: params?.owner_id
      ? [{ id: 'own-active', status: 'active' }, { id: 'own-hidden', status: 'hidden' }]
      : [
          {
            id: 'own-active', student_id: 'student-1', owner_id: 'faculty-1',
            author_name: 'Alex Reyes', author_department_name: 'Computer Science',
            body_text: 'Strong leadership and research skills.',
            body_document: { blocks: [{ type: 'paragraph', content: [{ text: 'Strong leadership and research skills.' }] }] },
            status: 'active', tags: ['leadership', 'research'], attachments: [],
            created_at: '2026-10-26T00:00:00Z', updated_at: '2026-10-26T00:00:00Z',
          },
        ],
    isPending: false,
    isError: false,
      error: null,
    };
  },
}));
vi.mock('../../hooks/useSearchStudents', () => ({
  useStudentSearchPage: () => ({ data: { students: [], total: 27 }, isPending: false }),
}));
vi.mock('../../hooks/useStudentById', () => ({
  useStudentsByIds: () => [{ data: { id: 'student-1', first_name: 'Maria', middle_name: null, last_name: 'Santos', program_id: 'program-1' }, isPending: false }],
}));
vi.mock('../../hooks/usePrograms', () => ({
  useApprovedProgramOptions: () => ({ data: [{ id: 'program-1', name: 'Bachelor of Science in Computer Science' }] }),
}));

const activeProfile: FacultyProfile = {
  id: 'faculty-1', role: 'faculty', status: 'active', email: 'alex@example.edu', full_name: 'Alex Reyes',
  department_id: 'department-1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};

function ProfileBootstrapper({ children, profile }: { children: ReactNode; profile: FacultyProfile }) {
  const { profile: currentProfile, loading, syncProfile } = useSession();
  const matches = currentProfile?.id === profile.id && currentProfile.status === profile.status;
  useEffect(() => { if (!loading && !matches) syncProfile(profile); }, [loading, matches, profile, syncProfile]);
  if (loading || !matches) return null;
  return <>{children}</>;
}

function renderDashboard(profile = activeProfile) {
  const queryClient = new QueryClient();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ProfileBootstrapper profile={profile}>
          <ThemeProvider><MemoryRouter><FacultyDashboardPage /></MemoryRouter></ThemeProvider>
        </ProfileBootstrapper>
      </SessionProvider>
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
}

describe('FacultyDashboardPage', () => {
  afterEach(cleanup);

  it('renders the greeting, dynamic statistics, quick links, and recent review details', async () => {
    hookCalls.reviewQueries.length = 0;
    renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Good day, Alex Reyes' })).toBeInTheDocument();
    await waitFor(() => expect(hookCalls.reviewQueries).toEqual(expect.arrayContaining([
      expect.objectContaining({ params: expect.objectContaining({ status: 'eq.active', limit: 5 }), enabled: true }),
      expect.objectContaining({ params: expect.objectContaining({ owner_id: 'eq.faculty-1' }), enabled: true }),
    ])));
    expect(screen.getByLabelText('Students statistic')).toHaveTextContent('27');
    expect(screen.getByLabelText('Your reviews statistic')).toHaveTextContent('2');

    expect(screen.getByRole('link', { name: /Browse students/ })).toHaveAttribute('href', '/faculty/students');
    expect(screen.getByRole('link', { name: /Write a review/ })).toHaveAttribute('href', '/faculty/students');
    expect(screen.getByRole('link', { name: /Open Chats/ })).toHaveAttribute('href', '/faculty/chat');
    expect(screen.getByRole('link', { name: /Register a student/ })).toHaveAttribute('href', '/faculty/students?register=true');
    expect(screen.queryByRole('button', { name: 'Refresh Feed' })).not.toBeInTheDocument();

    const author = screen.getAllByText(/Alex Reyes/).find((node) => node.classList.contains('review-feed-contributor')) as HTMLElement;
    const card = author.closest('.review-feed-item') as HTMLElement;
    expect(within(card).getByText(/· You/)).toBeInTheDocument();
    expect(card.querySelector('.review-feed-sub')?.textContent?.replace(/\s+/g, ' ')).toMatch(/Reviewing Maria Santos · Bachelor of Science in Computer Science · 2026-10-26/);
    expect(within(card).getByText('Active')).toHaveClass('ui-badge');
    expect(within(card).getByText('leadership')).toHaveClass('ui-badge');
    expect(within(card).getByText('research')).toHaveClass('ui-badge');
  });

  it('blocks pending faculty from querying dashboard review data', async () => {
    hookCalls.reviewQueries.length = 0;
    renderDashboard({ ...activeProfile, status: 'pending' });
    expect(await screen.findByText('Access Restricted')).toBeInTheDocument();
    expect(hookCalls.reviewQueries.length).toBeGreaterThan(0);
    expect(hookCalls.reviewQueries.every((query) => !query.enabled)).toBe(true);
    expect(screen.queryByRole('heading', { name: 'Recent active reviews' })).not.toBeInTheDocument();
  });
});
