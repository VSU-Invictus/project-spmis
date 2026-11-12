import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardSkeleton,
  EmptyState,
  Modal,
  Toast,
} from '../../components/ui';
import {
  ReviewDocumentView,
  ReviewFormModal,
  getTagBadgeVariant,
} from '../../components/reviews';
import { useSession } from '../../context/SessionContext';
import {
  usePrograms,
  useReviewRevisions,
  useSetReviewStatus,
  useStudentById,
  useStudentReviews,
  type Review,
} from '../../hooks';
import { ApiRequestError } from '../../lib/api';

function ReviewRevisionsSection({ reviewId }: { reviewId: string }) {
  const { data: revisions, isPending, isError, error } = useReviewRevisions({
    review_id: `eq.${reviewId}`,
    order: 'edited_at.desc,id.asc',
  });

  const revisionCount = revisions?.length ?? 0;

  return (
    <details style={{ marginTop: '6px' }}>
      <summary style={{ cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--muted-foreground)' }}>
        Edit history ({isPending ? '…' : revisionCount})
      </summary>
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '12px', borderLeft: '2px solid var(--border)' }}>
        {isPending && <small className="muted">Loading edit history…</small>}
        {isError && (
          <small style={{ color: 'var(--destructive)' }}>
            Unable to load edit history: {error?.message}
          </small>
        )}
        {!isPending && !isError && revisionCount === 0 && (
          <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
            This review has not been edited.
          </p>
        )}
        {!isPending &&
          revisions?.map((rev) => (
            <div key={rev.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <small className="muted">
                Previous version · {new Date(rev.edited_at).toLocaleDateString()}
              </small>
              <ReviewDocumentView
                document={rev.body_document_snapshot}
                fallbackText={rev.body_text_snapshot}
              />
              {rev.tags_snapshot && (
                <small className="muted">
                  Tags: {rev.tags_snapshot.length > 0 ? rev.tags_snapshot.join(', ') : 'None'}
                </small>
              )}
            </div>
          ))}
      </div>
    </details>
  );
}

export function FacultyStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useSession();

  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{
    code?: string;
    message: string;
    details?: string | null;
    hint?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleDocumentClick = () => setOpenKebabId(null);
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const {
    data: student,
    isPending: isStudentPending,
    isError: isStudentError,
    error: studentError,
  } = useStudentById(id);

  const { data: programs } = usePrograms();

  const {
    data: reviews,
    isPending: isReviewsPending,
    isError: isReviewsError,
    error: reviewsError,
  } = useStudentReviews(
    id
      ? {
          student_id: `eq.${id}`,
          order: 'created_at.desc,id.asc',
        }
      : undefined,
    {
      enabled: Boolean(id),
    }
  );

  const setReviewStatusMutation = useSetReviewStatus({
    onSuccess: (result) => {
      setActionError(null);
      setDeletingReview(null);
      if (result.status === 'hidden') {
        setToastMessage('Review hidden from public roster.');
      } else if (result.status === 'active') {
        setToastMessage('Review restored to active view.');
      } else if (result.status === 'deleted') {
        setToastMessage('Review deleted successfully!');
      }
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setActionError({
          code: err.code,
          message: err.message,
          details: err.details,
          hint: err.hint,
        });
      } else {
        setActionError({ message: err.message });
      }
    },
  });

  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';

  const visibleReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.filter(
      (review) =>
        review.status === 'active' ||
        (review.status === 'hidden' && isActiveFaculty && review.owner_id === profile?.id)
    );
  }, [reviews, isActiveFaculty, profile?.id]);

  const activeReviews = useMemo(
    () => visibleReviews.filter((review) => review.status === 'active'),
    [visibleReviews]
  );

  const activeTags = useMemo(() => {
    return [...new Set(activeReviews.flatMap((review) => review.tags ?? []))];
  }, [activeReviews]);

  const fullName = useMemo(() => {
    if (!student) return 'Student';
    return [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ');
  }, [student]);

  const programName = useMemo(() => {
    if (!student) return 'N/A';
    const matched = programs?.find((prog) => prog.id === student.program_id);
    return matched?.name ?? 'BS Computer Science';
  }, [student, programs]);

  return (
    <AppShell
      role={profile?.role === 'admin' ? 'admin' : 'faculty'}
      activeNavKey="students"
      breadcrumb="Faculty Portal / Student Detail"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Link
          to={profile?.role === 'admin' ? '/admin/students' : '/faculty/students'}
          className="ui-link-neutral back-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content', fontSize: '13px' }}
        >
          <span className="arrow-left">&larr;</span> Back to students
        </Link>

        <div
          className="header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>
              Student Information &amp; Reviews
            </h1>
            <p style={{ margin: 0, color: 'var(--muted-foreground)', fontSize: '14px' }}>
              Student information and attributed faculty reviews.
            </p>
          </div>
          {isActiveFaculty && student && (
            <Button
              id="new-review-link"
              variant="primary"
              onClick={() => {
                setActionError(null);
                setIsWriteOpen(true);
              }}
            >
              Write review
            </Button>
          )}
        </div>

        {(isStudentError || isReviewsError || actionError) && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-status-danger-subtle, rgba(239, 68, 68, 0.12))',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #ef4444)',
              fontSize: '13px',
            }}
          >
            {actionError ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {actionError.code && <Badge variant="destructive">{actionError.code}</Badge>}
                  <strong>{actionError.message}</strong>
                </div>
                {actionError.details && <div style={{ marginTop: '4px' }}>{actionError.details}</div>}
                {actionError.hint && <div style={{ marginTop: '4px', fontWeight: 600 }}>Hint: {actionError.hint}</div>}
              </>
            ) : (
              <>
                <strong>Error loading student record:</strong>{' '}
                {studentError?.message || reviewsError?.message}
              </>
            )}
          </div>
        )}

        {isStudentPending && <CardSkeleton />}

        {!isStudentPending && !student && (
          <EmptyState
            title="Student not found"
            description="This student record is unavailable or could not be found."
          />
        )}

        {!isStudentPending && student && (
          <>
            {/* Basic Information Card */}
            <section className="ui-card basic-info-card" aria-label="Basic Information">
              <div className="basic-info-header">
                <span className="basic-info-title">BASIC INFORMATION</span>
              </div>
              <dl className="basic-info-grid">
                <div className="basic-info-col">
                  <dt className="basic-info-label">FULL NAME</dt>
                  <dd className="basic-info-value" data-student-name>
                    {fullName}
                  </dd>
                </div>
                <div className="basic-info-col">
                  <dt className="basic-info-label">STUDENT ID</dt>
                  <dd className="basic-info-value" data-student-id>
                    {student.student_id_number}
                  </dd>
                </div>
                <div className="basic-info-col">
                  <dt className="basic-info-label">PROGRAM</dt>
                  <dd className="basic-info-value" data-student-program>
                    {programName}
                  </dd>
                </div>
                <div className="basic-info-col">
                  <dt className="basic-info-label">STATUS</dt>
                  <dd className="basic-info-value" data-student-status>
                    <Badge variant="success">Active</Badge>
                  </dd>
                </div>
                <div className="basic-info-col">
                  <dt className="basic-info-label">REVIEW TAGS</dt>
                  <dd className="basic-info-value" data-student-tags>
                    {activeTags.length > 0 ? (
                      <div className="ui-tags-cluster" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {activeTags.map((tag) => (
                          <Badge key={tag} variant={getTagBadgeVariant(tag)}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="neutral">No active reviews</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* AI Review Summary Card */}
            <section className="ui-card ai-summary-card" aria-labelledby="ai-summary-title">
              <div className="ai-summary-header">
                <div className="ai-summary-heading">
                  <span className="ai-summary-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
                    </svg>
                  </span>
                  <h2 className="ai-summary-title" id="ai-summary-title">
                    AI Review Summary
                  </h2>
                </div>
                <Badge variant="purple" className="ai-summary-badge">
                  AI-generated
                </Badge>
              </div>
              <p className="ai-summary-text">
                {activeReviews.length > 0
                  ? `${fullName} has ${activeReviews.length} attributed active ${activeReviews.length === 1 ? 'review' : 'reviews'} highlighting ${activeTags.length > 0 ? activeTags.join(', ') : 'academic coursework'}.`
                  : `No active faculty reviews are currently available to synthesize for ${fullName}.`}
              </p>
              <p className="ai-summary-meta">
                Generated from <span data-ai-review-count>{activeReviews.length}</span> active reviews. Hidden and deleted reviews are excluded.
              </p>
            </section>

            {/* Visible Reviews Section */}
            <div
              className="between"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}
            >
              <h2 style={{ margin: 0, fontSize: '18px' }}>Visible reviews</h2>
              <small>Active reviews + your own hidden reviews</small>
            </div>
            <p className="muted" style={{ margin: 0 }}>
              Reviews reflect their contributors’ assessments. Only the author can edit, hide, unhide, or delete a review.
            </p>

            <section id="reviews" aria-label="Student reviews">
              {isReviewsPending && (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              )}

              {!isReviewsPending && visibleReviews.length === 0 && (
                <Card className="empty" style={{ padding: '24px', textAlign: 'center' }}>
                  No visible reviews yet. Be the first to write one.
                </Card>
              )}

              {!isReviewsPending &&
                visibleReviews.map((review) => {
                  const isOwner = isActiveFaculty && review.owner_id === profile?.id;
                  const isHidden = review.status === 'hidden';
                  const isKebabOpen = openKebabId === review.id;

                  return (
                    <article
                      key={review.id}
                      className={`ui-card review ${isHidden ? 'hidden-review' : ''}`.trim()}
                      data-testid={`review-card-${review.id}`}
                    >
                      <div
                        className="between"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                            {review.author_name || 'Faculty Member'}
                            {isOwner ? ' · You' : ''}
                          </h3>
                          <small>
                            {review.author_department_name || 'Department'} ·{' '}
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </div>

                        <div className="review-header-right">
                          {isHidden && isOwner ? (
                            <Badge variant="neutral">Hidden · Only you</Badge>
                          ) : (
                            <Badge variant="success">Active</Badge>
                          )}

                          {isOwner && (
                            <div className="ui-dropdown-menu-container">
                              <button
                                type="button"
                                className="ui-btn-kebab"
                                aria-label="Review options"
                                aria-haspopup="true"
                                aria-expanded={isKebabOpen}
                                title="Review options"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenKebabId((prev) => (prev === review.id ? null : review.id));
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="19" cy="12" r="1.5" />
                                  <circle cx="5" cy="12" r="1.5" />
                                </svg>
                              </button>
                              <div
                                className="ui-kebab-menu"
                                role="menu"
                                hidden={!isKebabOpen}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="ui-kebab-item"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    setActionError(null);
                                    setEditingReview(review);
                                  }}
                                >
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="ui-kebab-item"
                                  role="menuitem"
                                  disabled={setReviewStatusMutation.isPending}
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    setActionError(null);
                                    setReviewStatusMutation.mutate({
                                      id: review.id,
                                      body: {
                                        action: isHidden ? 'unhide' : 'hide',
                                      },
                                    });
                                  }}
                                >
                                  <span>{isHidden ? 'Unhide' : 'Hide'}</span>
                                </button>
                                <button
                                  type="button"
                                  className="ui-kebab-item ui-kebab-item--danger"
                                  role="menuitem"
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    setActionError(null);
                                    setDeletingReview(review);
                                  }}
                                >
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <ReviewDocumentView
                        document={review.body_document}
                        fallbackText={review.body_text}
                      />

                      {review.tags && review.tags.length > 0 && (
                        <div className="review-tags">
                          {review.tags.map((tag) => (
                            <Badge key={tag} variant={getTagBadgeVariant(tag)}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {review.attachments && review.attachments.length > 0 && (
                        <div
                          className="review-attachments"
                          aria-label="Attachment metadata"
                          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}
                        >
                          {review.attachments.map((att) => (
                            <Badge key={att.id} variant="neutral">
                              📎 {att.mime_type} · {(att.size_bytes / 1024).toFixed(1)} KB
                            </Badge>
                          ))}
                        </div>
                      )}

                      <ReviewRevisionsSection reviewId={review.id} />
                    </article>
                  );
                })}
            </section>
          </>
        )}
      </div>

      {/* Write / Edit Review Modal */}
      {student && (isWriteOpen || editingReview) && (
        <ReviewFormModal
          isOpen={Boolean(isWriteOpen || editingReview)}
          onClose={() => {
            setIsWriteOpen(false);
            setEditingReview(null);
          }}
          mode={editingReview ? 'edit' : 'create'}
          studentId={student.id}
          studentName={fullName}
          studentIdNumber={student.student_id_number}
          studentProgram={programName}
          contributorName={profile?.full_name || 'Alex Reyes'}
          initialReview={editingReview}
          onSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {/* Design System Delete Review Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
        size="sm"
        title="Delete Review"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert
            variant="warning"
            title="Confirm Delete Decision"
            description="This action cannot be undone. The review will disappear from the portal, including your own view. Use Hide if you want to restore visibility later."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingReview(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={setReviewStatusMutation.isPending}
              onClick={() => {
                if (!deletingReview) return;
                setReviewStatusMutation.mutate({
                  id: deletingReview.id,
                  body: { action: 'delete' },
                });
              }}
            >
              {setReviewStatusMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Design System Toast Notification */}
      <Toast id="student-detail-toast" message={toastMessage} />
    </AppShell>
  );
}
