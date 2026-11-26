import { Link } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Badge,
  EmptyState,
  Skeleton,
  useMinimumLoadingDuration,
} from '../../components/ui';
import { ReviewDocumentView, getTagBadgeVariant } from '../../components/reviews';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { useStudentSearchPage } from '../../hooks/useSearchStudents';
import { useStudentsByIds } from '../../hooks/useStudentById';
import { useApprovedProgramOptions } from '../../hooks/usePrograms';
import { ApiRequestError } from '../../lib/api';
import { useSession } from '../../context/SessionContext';

function ReviewCardSkeleton() {
  return (
    <article className="review-feed-item" aria-hidden="true">
      <Skeleton className="skeleton" width="28%" height="16px" style={{ margin: 0 }} />
      <Skeleton className="skeleton" width="42%" height="13px" style={{ margin: 0 }} />
      <Skeleton className="skeleton" width="64%" height="16px" style={{ margin: 0 }} />
      <Skeleton className="skeleton" width="84px" height="26px" borderRadius="9999px" style={{ margin: 0 }} />
    </article>
  );
}

export function FacultyDashboardPage() {
  const { profile } = useSession();
  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';
  const {
    data: recentReviews,
    isPending: isRecentReviewsPending,
    isError: isRecentReviewsError,
    error: recentReviewsError,
  } = useStudentReviews({
    status: 'eq.active',
    order: 'created_at.desc,id.asc',
    limit: 5,
  }, {
    enabled: isActiveFaculty,
  });
  const { data: ownReviews, isPending: isOwnReviewsPending } = useStudentReviews({
    owner_id: profile?.id ? `eq.${profile.id}` : undefined,
  }, {
    enabled: isActiveFaculty && Boolean(profile?.id),
  });
  const { data: studentPage, isPending: isStudentCountPending } = useStudentSearchPage({
    limit: 1,
    offset: 0,
    order: 'created_at.desc,id.asc',
  }, { enabled: isActiveFaculty });
  const { data: programs } = useApprovedProgramOptions({ enabled: isActiveFaculty });
  const studentIds = [...new Set((recentReviews ?? []).map((review) => review.student_id))];
  const studentQueries = useStudentsByIds(studentIds, isActiveFaculty);
  const studentsById = new Map(studentIds.map((id, index) => [id, studentQueries[index]?.data]));
  const programsById = new Map((programs ?? []).map((program) => [program.id, program.name]));
  const isRecentContentPending = useMinimumLoadingDuration(
    isRecentReviewsPending || studentQueries.some((query) => query.isPending)
  );

  if (!isActiveFaculty) {
    return (
      <AppShell role={profile?.role === 'admin' ? 'admin' : 'faculty'} activeNavKey="dashboard" breadcrumb="Faculty Portal / Overview">
        <div style={{ padding: '24px 0', maxWidth: '640px' }}>
          <div role="alert" style={{ padding: '20px 24px', backgroundColor: 'var(--destructive-subtle, #fee2e2)', border: '1px solid var(--destructive, #ef4444)', borderRadius: 'var(--radius-md, 8px)', color: 'var(--destructive, #b91c1c)' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Access Restricted</h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>The faculty dashboard is available only to active, verified faculty members.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="faculty"
      activeNavKey="dashboard"
      breadcrumb="Faculty Portal / Overview"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header with Title and Create Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title ui-heading-1" style={{ marginBottom: '6px' }}>
              Good day, {profile?.full_name || 'Faculty Member'}
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Your reviews, student research, and application updates in one place.
            </p>
          </div>
        </div>

        {/* Dashboard statistics */}
        <div className="stats">
          <section className="ui-card stat" aria-label="Students statistic">
            <span className="muted">Students</span>
            <strong>{isStudentCountPending ? '—' : studentPage?.total ?? 0}</strong>
            <small>Approved sample roster</small>
          </section>
          <section className="ui-card stat" aria-label="Your reviews statistic">
            <span className="muted">Your reviews</span>
            <strong>{isOwnReviewsPending ? '—' : ownReviews?.length ?? 0}</strong>
            <small>Active and hidden</small>
          </section>
        </div>

        <section className="ui-card dashboard-quick-links" aria-labelledby="dashboard-quick-links-title">
          <h2 id="dashboard-quick-links-title">Quick links</h2>
          <div className="quick-links">
            <Link to="/faculty/students" className="quick-link-item ui-card-interactive">
              <h3>Browse students <span className="arrow" aria-hidden="true">&rarr;</span></h3>
              <p>Search records and active reviews.</p>
            </Link>
            <Link to="/faculty/students" className="quick-link-item ui-card-interactive">
              <h3>Write a review <span className="arrow" aria-hidden="true">&rarr;</span></h3>
              <p>Select a student to add text and tags.</p>
            </Link>
            <Link to="/faculty/chat" className="quick-link-item ui-card-interactive">
              <h3>Open Chats <span className="arrow" aria-hidden="true">&rarr;</span></h3>
              <p>Explore reviews across students.</p>
            </Link>
            <Link to="/faculty/students?register=true" className="quick-link-item ui-card-interactive">
              <h3>Register a student <span className="arrow" aria-hidden="true">&rarr;</span></h3>
              <p>Submit a registration application.</p>
            </Link>
          </div>
        </section>

        {isRecentReviewsError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
              fontSize: '14px',
            }}
          >
            <strong>Unable to load recent reviews.</strong>{' '}
            {recentReviewsError instanceof ApiRequestError
              ? <>{recentReviewsError.message}{recentReviewsError.hint ? ` ${recentReviewsError.hint}` : ''}</>
              : 'Please try again in a moment.'}
          </div>
        )}
        <section className="ui-card dashboard-reviews" aria-labelledby="dashboard-reviews-title">
          <div className="between">
            <h2 id="dashboard-reviews-title">Recent active reviews</h2>
            <Link className="ui-link-neutral" to="/faculty/students">
              Browse all students <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="review-feed" aria-busy={isRecentContentPending}>
            {isRecentContentPending && (
              <>
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
              </>
            )}

            {!isRecentContentPending && !isRecentReviewsError && (!recentReviews || recentReviews.length === 0) && (
              <EmptyState title="No recent active reviews" description="Active reviews will appear here." />
            )}

            {!isRecentContentPending && recentReviews?.map((review) => {
              const student = studentsById.get(review.student_id);
              const studentName = student
                ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ')
                : 'Student';
              const programName = student ? programsById.get(student.program_id) : undefined;
              const isOwnReview = review.owner_id === profile?.id;

              return (
                <article className="review-feed-item" key={review.id}>
                  <div className="review-feed-head">
                    <div className="review-feed-meta">
                      <span className="review-feed-contributor">
                        {review.author_name}
                        {isOwnReview && <span className="review-feed-you"> · You</span>}
                      </span>
                      <span className="review-feed-sub">
                        Reviewing{' '}
                        {student ? (
                          <Link className="review-feed-student" to={`/faculty/students/${student.id}`}>
                            {studentName}
                          </Link>
                        ) : studentName}
                        {' · '}{programName || 'Program unavailable'}{' · '}{review.created_at.slice(0, 10)}
                      </span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="review-feed-body">
                    <ReviewDocumentView document={review.body_document} fallbackText={review.body_text} />
                  </div>

                  {review.tags.length > 0 && (
                    <div className="review-feed-tags">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant={getTagBadgeVariant(tag)}>{tag}</Badge>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
