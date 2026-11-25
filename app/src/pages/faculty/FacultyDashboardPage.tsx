import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Toast,
} from '../../components/ui';
import { ReviewDocumentView, ReviewFormModal, getTagBadgeVariant } from '../../components/reviews';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { useSearchStudents } from '../../hooks/useSearchStudents';
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handleCloseCreateModal = useCallback(() => setIsCreateOpen(false), []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const {
    data: reviews,
    isPending: isReviewsPending,
    isFetching: isReviewsFetching,
    isError,
    error: reviewsError,
    refetch,
  } = useStudentReviews({
    status: 'eq.active',
    order: 'created_at.desc,id.asc',
  });
  const {
    data: students,
    isPending: isStudentsPending,
    isFetching: isStudentsFetching,
  } = useSearchStudents();
  const studentsById = new Map((students ?? []).map((student) => [student.id, student]));
  const isDashboardFetching = isReviewsFetching || isStudentsFetching;
  const [showRefreshSkeleton, setShowRefreshSkeleton] = useState(false);

  useEffect(() => {
    if (isDashboardFetching) {
      setShowRefreshSkeleton(true);
      return;
    }

    const timer = window.setTimeout(() => setShowRefreshSkeleton(false), 500);
    return () => window.clearTimeout(timer);
  }, [isDashboardFetching]);

  return (
    <AppShell
      role="faculty"
      activeNavKey="dashboard"
      breadcrumb="Faculty Portal / Overview"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {showRefreshSkeleton && (
          <div className="dashboard-refresh-status" role="status" aria-live="polite" aria-busy={isDashboardFetching}>
            <span>{isReviewsPending || isStudentsPending ? 'Loading dashboard…' : 'Refreshing dashboard…'}</span>
            <Skeleton className="skeleton" height="4px" style={{ margin: 0 }} />
          </div>
        )}
        {/* Header with Title and Create Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Good day, {profile?.full_name || 'Faculty Member'}
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Your reviews, student research, and application updates in one place.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRefreshSkeleton(true);
                void refetch();
              }}
            >
              Refresh Feed
            </Button>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Write Student Review
            </Button>
          </div>
        </div>

        {/* Dashboard statistics */}
        <div className="stats">
          <section className="ui-card stat" aria-label="Students statistic">
            <span className="muted">Students</span>
            <strong>20</strong>
            <small>Approved sample roster</small>
          </section>
          <section className="ui-card stat" aria-label="Your reviews statistic">
            <span className="muted">Your reviews</span>
            <strong>3</strong>
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

        {/* Global Error Banner */}
        {isError && (
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
            <strong>Prism Mock Error:</strong> {reviewsError?.message}
          </div>
        )}
        <section className="ui-card dashboard-reviews" aria-labelledby="dashboard-reviews-title">
          <div className="between">
            <h2 id="dashboard-reviews-title">Recent active reviews</h2>
            <Link className="ui-link-neutral" to="/faculty/students">
              Browse all students <span className="arrow" aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="review-feed" aria-busy={isDashboardFetching}>
            {showRefreshSkeleton && (
              <>
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
                <ReviewCardSkeleton />
              </>
            )}

            {!showRefreshSkeleton && (!reviews || reviews.length === 0) && (
              <EmptyState title="No recent active reviews" description="Active reviews will appear here." />
            )}

            {!showRefreshSkeleton && reviews?.map((review) => {
              const student = studentsById.get(review.student_id);
              const studentName = student
                ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ')
                : 'Student';
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
                        {' · '}{student?.program_name || 'Program unavailable'}{' · '}{review.created_at.slice(0, 10)}
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

      <ReviewFormModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreateModal}
        mode="create"
        studentId="45b54332-e470-4c21-a839-7428c4f6bf42"
        allowStudentIdEdit
        enableDevFailureSimulator
        contributorName={profile?.full_name || 'Faculty Member'}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      <Toast id="dashboard-review-toast" message={toastMessage} />
    </AppShell>
  );
}
