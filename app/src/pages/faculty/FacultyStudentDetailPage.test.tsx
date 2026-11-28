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

function renderStudentDetailPage(
  customProfile?: Partial<FacultyProfile>,
  initialRoute = `/faculty/students/${studentId}`
) {
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
            <MemoryRouter initialEntries={[initialRoute]}>
              <Routes>
                <Route path="/faculty/students/:id" element={<FacultyStudentDetailPage />} />
                <Route path="/faculty/students/:id/new-review" element={<FacultyStudentDetailPage />} />
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
      await screen.findByText('BS Computer Science')
    ).toBeInTheDocument();

    // Attributed review body, YYYY-MM-DD metadata date, & attachment metadata
    expect(
      await screen.findByText('Demonstrated strong leadership and research skills.')
    ).toBeInTheDocument();
    expect(screen.getByText('Computer Science · 2026-10-26')).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf/i)).toBeInTheDocument();

    // Edit history loaded via useReviewRevisions with YYYY-MM-DD date
    expect(await screen.findByText(/Edit history \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('Previous version · 2026-10-25')).toBeInTheDocument();
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

    expect(
      await screen.findByRole('heading', { name: /Write a review/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Back to student/i)).toBeInTheDocument();
    expect(screen.getByText('BS Computer Science')).toBeInTheDocument();

    const publishBtn = screen.getByRole('button', { name: /publish review/i });

    // Submit empty review -> inline validation error
    await user.click(publishBtn);
    expect(await screen.findByText(/Enter a review before saving/i)).toBeInTheDocument();

    const editor = screen.getByLabelText(/review text/i);

    // >500 words -> live counter and inline validation error
    const overLimitText = Array(501).fill('analysis').join(' ');
    await user.clear(editor);
    await user.paste(overLimitText);
    expect(screen.getByTestId('review-word-counter')).toHaveTextContent('501 / 500 words');

    await user.click(publishBtn);
    expect(
      await screen.findByText(/A review can contain no more than 500 words/i)
    ).toBeInTheDocument();

    // Valid rich-text review with formatting toolbar and tag autocomplete
    await user.clear(editor);
    await user.paste('Demonstrated **excellent** project execution.');
    await user.click(screen.getByRole('button', { name: /bulleted list/i }));
    expect(editor).toHaveTextContent(/Demonstrated.*excellent.*project execution/i);
    expect(editor.querySelector('ul li')).not.toBeNull();

    const tagInput = screen.getByLabelText(/tags/i);
    await user.click(tagInput);
    await user.paste('rob');

    const suggestionOption = await screen.findByRole('option', { name: /#robotics/i });
    await user.click(suggestionOption);

    await user.click(publishBtn);

    // Navigates back to student detail, toast displays, new review is rendered, and queries are invalidated
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Write a review/i })).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/Review published successfully!/i)).toBeInTheDocument();
    expect(await screen.findByText(/project execution/i)).toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listStudentReviews'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['searchStudents'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['listTags'] });
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
    await user.paste('Updated assessment noting strong **algorithms** mastery.');
    expect(editor).toHaveTextContent('Updated assessment noting strong **algorithms** mastery.');

    const saveBtn = within(dialog).getByRole('button', { name: /save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/Review updated successfully!/i)).toBeInTheDocument();
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
    expect(confirmDialog.querySelector('.ui-modal-card.delete-review-modal')).not.toBeNull();
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
      ),
      http.post('*/functions/v1/reviews/:id/status', () =>
        HttpResponse.json(
          {
            code: 'REVIEW_STATUS_CONFLICT',
            message: 'Review status transition conflicted with current state.',
            details: 'The review was already modified.',
            hint: 'Refresh the student page and try again.',
          },
          { status: 409 }
        )
      )
    );

    renderStudentDetailPage();

    // 1. Server-side 422 on createReview
    await user.click(await screen.findByRole('button', { name: /write review/i }));
    expect(
      await screen.findByRole('heading', { name: /Write a review/i })
    ).toBeInTheDocument();

    const editor = screen.getByLabelText(/review text/i);
    await user.click(editor);
    await user.paste('Valid client text that triggers simulated server 422.');
    expect(editor).toHaveTextContent('Valid client text that triggers simulated server 422.');

    await user.click(screen.getByRole('button', { name: /publish review/i }));

    expect(await screen.findByText('REVIEW_WORD_LIMIT')).toBeInTheDocument();
    expect(screen.getByText('Reviews must contain no more than 500 words.')).toBeInTheDocument();
    expect(screen.getByText(/Shorten the review and submit it again/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // 2. Server-side 409 on setReviewStatus
    const reviewCard = await screen.findByTestId('review-card-67015de8-1ce8-4ac4-8634-384bf5fb3821');
    await user.click(within(reviewCard).getByRole('button', { name: /review options/i }));
    await user.click(within(reviewCard).getByRole('menuitem', { name: /^hide$/i }));

    expect(await screen.findByText('REVIEW_STATUS_CONFLICT')).toBeInTheDocument();
    expect(screen.getByText(/Refresh the student page and try again/i)).toBeInTheDocument();
  });

  it('renders the full-page compose view on /faculty/students/:id/new-review and blocks invalid uncommitted tagDraft on submit', async () => {
    const user = userEvent.setup();
    renderStudentDetailPage(undefined, `/faculty/students/${studentId}/new-review`);

    expect(
      await screen.findByRole('heading', { name: /Write a review/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const editor = await screen.findByLabelText(/review text/i);
    await user.click(editor);
    await user.paste('Assessment with an overly long uncommitted tag draft.');

    const tagInput = screen.getByLabelText(/tags/i);
    await user.click(tagInput);
    await user.paste('a'.repeat(55));

    await user.click(screen.getByRole('button', { name: /publish review/i }));

    expect(
      await screen.findByText(/Each tag must be 50 characters or fewer/i)
    ).toBeInTheDocument();
  });

  it('redirects non-active faculty or admin away from /faculty/students/:id/new-review back to /faculty/students/:id', async () => {
    renderStudentDetailPage(
      { role: 'admin', status: 'active', full_name: 'System Admin' },
      `/faculty/students/${studentId}/new-review`
    );

    expect(
      await screen.findByRole('heading', { name: /Student Information & Reviews/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Write a review/i })).not.toBeInTheDocument();
  });

  it('renders AI Review Summary panel between basic info and review list, excluding hidden reviews (#156)', async () => {
    server.use(
      http.get('*/rest/v1/review_details', () =>
        HttpResponse.json([
          {
            id: 'active-rev-1',
            student_id: studentId,
            owner_id: ownerId,
            author_name: 'Alex Reyes',
            author_department_name: 'Computer Science',
            body_text: 'Active review praising algorithms mastery.',
            status: 'active',
            tags: ['algorithms'],
            created_at: '2026-10-26T00:00:00.000Z',
            updated_at: '2026-10-26T00:00:00.000Z',
          },
          {
            id: 'hidden-rev-2',
            student_id: studentId,
            owner_id: ownerId,
            author_name: 'Alex Reyes',
            author_department_name: 'Computer Science',
            body_text: 'Hidden review that should NOT contribute to AI summary.',
            status: 'hidden',
            tags: ['hidden-skill'],
            created_at: '2026-10-26T00:00:00.000Z',
            updated_at: '2026-10-26T00:00:00.000Z',
          },
        ])
      )
    );

    renderStudentDetailPage();

    expect(await screen.findByRole('heading', { name: /AI Review Summary/i })).toBeInTheDocument();
    expect(screen.getByText(/AI-generated/i)).toBeInTheDocument();

    // Summary counts only active reviews (1) with singular grammar, excludes hidden review from AI synthesis
    const aiSummarySection = screen.getByRole('heading', { name: /AI Review Summary/i }).closest('section')!;
    const countElement = within(aiSummarySection).getByTestId('ai-review-count');
    expect(countElement).toHaveTextContent('1');
    expect(aiSummarySection).toHaveTextContent(/Generated from 1 active review\./i);
    expect(within(aiSummarySection).getByText(/highlighting algorithms/i)).toBeInTheDocument();
    expect(within(aiSummarySection).getByText(/Contributors from Computer Science/i)).toBeInTheDocument();
    expect(within(aiSummarySection).queryByText(/hidden-skill/i)).not.toBeInTheDocument();
  });

  it('caps Basic Information Review Tags at 2 with a +N pill, renders kebab icons, updates AI summary on hide, and uses single-button Delete modal (#186)', async () => {
    const user = userEvent.setup();
    server.use(
      http.get('*/rest/v1/review_details', () =>
        HttpResponse.json([
          {
            id: 'owned-1',
            student_id: studentId,
            owner_id: ownerId,
            author_name: 'Alex Reyes',
            author_department_name: 'Computer Science',
            body_text: 'Strong research planning and teamwork.',
            status: 'active',
            tags: ['research', 'teamwork', 'robotics'],
            created_at: '2026-11-23T09:00:00.000Z',
            updated_at: '2026-11-23T09:00:00.000Z',
          },
          {
            id: 'peer-2',
            student_id: studentId,
            owner_id: otherFacultyId,
            author_name: 'Jamie Rivera',
            author_department_name: 'Engineering',
            body_text: 'Clear communication during prototype demos.',
            status: 'active',
            tags: ['communication'],
            created_at: '2026-11-22T09:00:00.000Z',
            updated_at: '2026-11-22T09:00:00.000Z',
          },
        ])
      )
    );

    const { container } = renderStudentDetailPage();

    // Basic Info shows short program and TagCluster (2 visible tags + +2 overflow pill)
    expect(await screen.findByText('BS Computer Science')).toBeInTheDocument();
    const basicTags = container.querySelector('[data-student-tags]') as HTMLElement;
    const directVisibleBadges = basicTags.querySelectorAll(':scope > .ui-tags-cluster > .ui-badge');
    expect(directVisibleBadges).toHaveLength(2);
    expect(directVisibleBadges[0]).toHaveTextContent('research');
    expect(directVisibleBadges[1]).toHaveTextContent('teamwork');
    expect(within(basicTags).getByRole('button', { name: /2 more tags/i })).toHaveTextContent('+2');

    // Plural AI summary meta for 2 active reviews
    const aiSummarySection = screen.getByRole('heading', { name: /AI Review Summary/i }).closest('section')!;
    expect(aiSummarySection).toHaveTextContent(/Generated from 2 active reviews\./i);

    // Kebab menu items include SVG icons and accent classes
    const ownedCard = await screen.findByTestId('review-card-owned-1');
    await user.click(within(ownedCard).getByRole('button', { name: /review options/i }));

    const editItem = within(ownedCard).getByRole('menuitem', { name: /^edit$/i });
    const hideItem = within(ownedCard).getByRole('menuitem', { name: /^hide$/i });
    const deleteItem = within(ownedCard).getByRole('menuitem', { name: /^delete$/i });
    expect(editItem).toHaveClass('ui-kebab-item--primary');
    expect(editItem.querySelector('svg')).not.toBeNull();
    expect(hideItem.querySelector('svg')).not.toBeNull();
    expect(deleteItem).toHaveClass('ui-kebab-item--danger');
    expect(deleteItem.querySelector('svg')).not.toBeNull();

    // Delete Review modal uses single full-width Confirm Delete button without Cancel
    await user.click(deleteItem);
    const deleteDialog = await screen.findByRole('dialog');
    expect(within(deleteDialog).getByText('Delete Review')).toBeInTheDocument();
    expect(within(deleteDialog).getByRole('button', { name: /confirm delete/i })).toHaveClass('modal-submit');
    expect(within(deleteDialog).queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });
});
