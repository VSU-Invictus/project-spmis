import { useEffect, useState } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Button,
  Card,
  Badge,
  EmptyState,
  CardSkeleton,
  Toast,
} from '../../components/ui';
import { ReviewDocumentView, ReviewFormModal, getTagBadgeVariant } from '../../components/reviews';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { useSession } from '../../context/SessionContext';

export function FacultyDashboardPage() {
  const { profile } = useSession();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const {
    data: reviews,
    isPending,
    isError,
    error: reviewsError,
    refetch,
  } = useStudentReviews({
    status: 'eq.active',
    order: 'created_at.desc,id.asc',
  });

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
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Faculty Intelligence Feed
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Recent peer reviews across academic departments powered by Prism mock API.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => refetch()}>
              Refresh Feed
            </Button>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Write Student Review
            </Button>
          </div>
        </div>

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

        {/* Feed List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isPending && (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          )}

          {!isPending && (!reviews || reviews.length === 0) && (
            <EmptyState
              title="No recent reviews in feed"
              description="Click 'Write Student Review' to create your first attributed review."
            />
          )}

          {!isPending &&
            reviews?.map((review) => (
              <Card
                key={review.id}
                style={{
                  padding: '20px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>
                      {review.author_name}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginLeft: '8px' }}>
                      · {review.author_department_name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant={review.status === 'active' ? 'success' : 'muted'}>
                      {review.status}
                    </Badge>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <ReviewDocumentView
                  document={review.body_document}
                  fallbackText={review.body_text}
                />

                {review.tags && review.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {review.tags.map((tag, idx) => (
                      <Badge key={idx} variant={getTagBadgeVariant(tag)}>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
        </div>
      </div>

      <ReviewFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
        studentId="45b54332-e470-4c21-a839-7428c4f6bf42"
        allowStudentIdEdit
        enableDevFailureSimulator
        contributorName={profile?.full_name || 'Alex Reyes'}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      <Toast id="dashboard-review-toast" message={toastMessage} />
    </AppShell>
  );
}
