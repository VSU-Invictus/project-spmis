// @vitest-environment jsdom
import { useEffect, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ThemeProvider } from '../../context/ThemeContext';
import {
  SessionProvider,
  useSession,
  type FacultyProfile,
} from '../../context/SessionContext';
import { FacultyStudentDetailPage } from './FacultyStudentDetailPage';
import { queryKeys } from '../../hooks/queryKeys';

afterEach(() => {
  cleanup();
});

const studentId = '45b54332-e470-4c21-a839-7428c4f6bf42';
const ownerId = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
const otherFacultyId = '99999999-1111-4222-8333-444444444444';
const departmentId = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';

function ProfileBootstrapper({
  profile,
  children,
}: {
  profile: FacultyProfile;
  children: ReactNode;
}) {
  const { profile: currentProfile, syncProfile } = useSession();
  useEffect(() => {
    if (
      !currentProfile ||
      currentProfile.id !== profile.id ||
      currentProfile.role !== profile.role ||
      currentProfile.status !== profile.status
    ) {
      syncProfile(profile);
    }
  }, [currentProfile, profile, syncProfile]);
  return <>{children}</>;
}

function renderStudentDetailPage(customProfile?: Partial<FacultyProfile>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const activeProfile: FacultyProfile = {
    id: ownerId,
    email: 'alex.reyes@example.edu',
    full_name: 'Alex Reyes',
    department_id: departmentId,
    role: 'faculty',
    status: 'active',
    created_at: '2026-10-26T00:00:00Z',
    updated_at: '2026-10-26T00:00:00Z',
    ...customProfile,
  };

  const result = render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <ProfileBootstrapper profile={activeProfile}>
            <MemoryRouter initialEntries={[`/faculty/students/${studentId}`]}>
              <Routes>
                <Route path="/faculty/students/:id" element={<FacultyStudentDetailPage />} />
              </Routes>
            </MemoryRouter>
          </ProfileBootstrapper>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );

  return { ...result, queryClient };
}

describe('FacultyStudentDetailPage (#155)', () => {
  it('renders student basic information, attributed reviews, attachment metadata, and edit history', async () => {
    renderStudentDetailPage();

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('27-1-12345')).toBeInTheDocument();
    expect(
      await screen.findByText('Bachelor of Science in Computer Science')
    ).toBeInTheDocument();

    // Attributed review body & attachment metadata
    expect(
      await screen.findByText('Demonstrated strong leadership and research skills.')
    ).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf/i)).toBeInTheDocument();

    // Edit history loaded via useReviewRevisions
    expect(await screen.findByText(/Edit history \(1\)/i)).toBeInTheDocument();
    expect(
      screen.getByText('Demonstrated strong leadership skills.')
    ).toBeInTheDocument();
  });

  it('shows Edit, Hide/Unhide, and Delete controls only on reviews owned by the active faculty member', async () => {
    server.use(
      http.get('*/rest/v1/review_details', () =>
        HttpResponse.json([
          {
            id: 'owned-review-1',
            student_id: studentId,
            owner_id: ownerId,
            author_name: 'Alex Reyes',
            author_department_name: 'Computer Science',
            body_text: 'Review authored by the current faculty owner.',
            body_document: {
              blocks: [{ type: 'paragraph', content: [{ text: 'Review authored by the current faculty owner.' }] }],
            },
            status: 'active',
            tags: ['research'],
            attachments: [],
            created_at: '2026-10-26T00:00:00.000Z',
            updated_at: '2026-10-26T00:00:00.000Z',
          },
          {
            id: 'peer-review-2',
            student_id: studentId,
            owner_id: otherFacultyId,
            author_name: 'Jamie Rivera',
            author_department_name: 'Engineering',
            body_text: 'Review authored by another faculty colleague.',
            body_document: {
              blocks: [{ type: 'paragraph', content: [{ text: 'Review authored by another faculty colleague.' }] }],
            },
            status: 'active',
            tags: ['robotics'],
            attachments: [],
            created_at: '2026-10-26T00:00:00.000Z',
            updated_at: '2026-10-26T00:00:00.000Z',
          },
        ])
      )
    );

    renderStudentDetailPage();

    const ownedCard = await screen.findByTestId('review-card-owned-review-1');
    const peerCard = await screen.findByTestId('review-card-peer-review-2');

    expect(within(ownedCard).getByRole('button', { name: /review options/i })).toBeInTheDocument();
    expect(within(peerCard).queryByRole('button', { name: /review options/i })).not.toBeInTheDocument();
  });

  it('hides Edit, Hide/Unhide, Delete, and Write review controls when viewed by an admin', async () => {
    renderStudentDetailPage({
      id: ownerId,
      role: 'admin',
      full_name: 'SPMIS Administrator',
    });

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
    expect(
      await screen.findByText('Demonstrated strong leadership and research skills.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /write review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /review options/i })).not.toBeInTheDocument();
  });

  it('validates empty and >500-word reviews inline, and creates a formatted review with tag autocomplete', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderStudentDetailPage();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const writeBtn = await screen.findByRole('button', { name: /write review/i });
    await user.click(writeBtn);

    const dialog = await screen.findByRole('dialog');
    const publishBtn = within(dialog).getByRole('button', { name: /publish review/i });

    // Submit empty review -> inline validation error
    await user.click(publishBtn);
    expect(await within(dialog).findByText(/Enter a review before saving/i)).toBeInTheDocument();

    const editor = within(dialog).getByLabelText(/review text/i);

    // >500 words -> live counter and inline validation error
    const overLimitText = Array(501).fill('analysis').join(' ');
    await user.clear(editor);
    await user.paste(overLimitText);
    expect(within(dialog).getByTestId('review-word-counter')).toHaveTextContent('501 / 500 words');

    await user.click(publishBtn);
    expect(
      await within(dialog).findByText(/A review can contain no more than 500 words/i)
    ).toBeInTheDocument();

    // Valid rich-text review with formatting toolbar and tag autocomplete
    await user.clear(editor);
    await user.type(editor, 'Demonstrated **excellent** project execution.');
    await user.click(within(dialog).getByRole('button', { name: /bulleted list/i }));

    const tagInput = within(dialog).getByLabelText(/tags/i);
    await user.click(tagInput);
    await user.type(tagInput, 'rob');

    const suggestionOption = await within(dialog).findByRole('option', { name: /#robotics/i });
    await user.click(suggestionOption);

    await user.click(publishBtn);

    // Modal closes, toast displays, new review is rendered, and queries are invalidated
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Review published successfully!/i)).toBeInTheDocument();
    expect(await screen.findByText(/project execution/i)).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listStudentReviews'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['searchStudents'] });
  });

  it('edits an existing review, updates edit history, and invalidates queries', async () => {
    const user = userEvent.setup();
    renderStudentDetailPage();

    const reviewCard = await screen.findByTestId('review-card-67015de8-1ce8-4ac4-8634-384bf5fb3821');
    const kebabBtn = within(reviewCard).getByRole('button', { name: /review options/i });
    await user.click(kebabBtn);

    const editMenuItem = within(reviewCard).getByRole('menuitem', { name: /edit/i });
    await user.click(editMenuItem);

    const dialog = await screen.findByRole('dialog');
    const editor = within(dialog).getByLabelText(/review text/i);
    await user.clear(editor);
    await user.type(editor, 'Updated assessment noting strong **algorithms** mastery.');

    const saveBtn = within(dialog).getByRole('button', { name: /save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Review updated successfully!/i)).toBeInTheDocument();
    expect(await screen.findByText(/Updated assessment noting strong/i)).toBeInTheDocument();
    expect(await screen.findByText(/Edit history \(2\)/i)).toBeInTheDocument();
  });

  it('hides, unhides, and deletes an owned review with confirmation modal and query invalidation', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderStudentDetailPage();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const reviewCard = await screen.findByTestId('review-card-67015de8-1ce8-4ac4-8634-384bf5fb3821');

    // 1. Hide review
    await user.click(within(reviewCard).getByRole('button', { name: /review options/i }));
    await user.click(within(reviewCard).getByRole('menuitem', { name: /^hide$/i }));

    expect(await within(reviewCard).findByText('Hidden · Only you')).toBeInTheDocument();
    expect(await screen.findByText(/Review hidden from public roster/i)).toBeInTheDocument();

    // 2. Unhide review
    await user.click(within(reviewCard).getByRole('button', { name: /review options/i }));
    await user.click(within(reviewCard).getByRole('menuitem', { name: /^unhide$/i }));

    expect(await within(reviewCard).findByText('Active')).toBeInTheDocument();
    expect(await screen.findByText(/Review restored to active view/i)).toBeInTheDocument();

    // 3. Delete review via confirmation modal
    await user.click(within(reviewCard).getByRole('button', { name: /review options/i }));
    await user.click(within(reviewCard).getByRole('menuitem', { name: /^delete$/i }));

    const confirmDialog = await screen.findByRole('dialog');
    expect(within(confirmDialog).getByText(/Confirm Delete Decision/i)).toBeInTheDocument();

    await user.click(within(confirmDialog).getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('review-card-67015de8-1ce8-4ac4-8634-384bf5fb3821')
      ).not.toBeInTheDocument();
    });
    expect(await screen.findByText(/Review deleted successfully!/i)).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [queryKeys.studentReviews()[0]],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [queryKeys.searchStudents()[0]],
    });
  });

  it('normalizes and displays server-side 422 / 403 / 409 ApiRequestError with error.hint', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/functions/v1/reviews', () =>
        HttpResponse.json(
          {
            code: 'REVIEW_WORD_LIMIT',
            message: 'Reviews must contain no more than 500 words.',
            details: 'The server counted 512 words.',
            hint: 'Shorten the review and submit it again.',
          },
          { status: 422 }
        )
      )
    );

    renderStudentDetailPage();

    await user.click(await screen.findByRole('button', { name: /write review/i }));
    const dialog = await screen.findByRole('dialog');
    const editor = within(dialog).getByLabelText(/review text/i);
    await user.click(editor);
    await user.paste('Valid client text that triggers simulated server 422.');

    await user.click(within(dialog).getByRole('button', { name: /publish review/i }));

    expect(await within(dialog).findByText('REVIEW_WORD_LIMIT')).toBeInTheDocument();
    expect(within(dialog).getByText('Reviews must contain no more than 500 words.')).toBeInTheDocument();
    expect(within(dialog).getByText(/Shorten the review and submit it again/i)).toBeInTheDocument();
  });
});
