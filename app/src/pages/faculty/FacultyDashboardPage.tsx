import React, { useState } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import {
  Button,
  Card,
  Badge,
  Input,
  Label,
  EmptyState,
  CardSkeleton,
  Modal,
} from '../../components/ui';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { useCreateReview } from '../../hooks/useCreateReview';
import { ApiRequestError } from '../../lib/api';

export function FacultyDashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [studentId, setStudentId] = useState('45b54332-e470-4c21-a839-7428c4f6bf42');
  const [reviewBody, setReviewBody] = useState('');
  const [tagsInput, setTagsInput] = useState('research, leadership');
  const [failureMode, setFailureMode] = useState<'none' | '422_word_limit' | '422_empty_body'>('none');
  const [formError, setFormError] = useState<{
    code?: string;
    message: string;
    details?: string | null;
    hint?: string | null;
  } | null>(null);

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

  const createReviewMutation = useCreateReview({
    onSuccess: () => {
      setIsCreateOpen(false);
      setReviewBody('');
      setFormError(null);
      setFailureMode('none');
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setFormError({
          code: err.code,
          message: err.message,
          details: err.details,
          hint: err.hint,
        });
      } else {
        setFormError({ message: err.message });
      }
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let headers: Record<string, string> | undefined;
    if (import.meta.env.DEV && failureMode === '422_word_limit') {
      headers = { Prefer: 'code=422, example=wordLimit' };
    } else if (import.meta.env.DEV && failureMode === '422_empty_body') {
      headers = { Prefer: 'code=422, example=emptyReview' };
    }

    createReviewMutation.mutate({
      body: {
        student_id: studentId,
        body_document: {
          blocks: [
            {
              type: 'paragraph',
              content: [
                {
                  text: reviewBody,
                },
              ],
            },
          ],
        },
        tags: tags.length > 0 ? tags : undefined,
      },
      headers,
    });
  };

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

                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--foreground)' }}>
                  {review.body_text}
                </p>

                {review.tags && review.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {review.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
        </div>
      </div>

      {/* Create Review Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Contribute Student Review"
        description="Your review will be attributed to your verified faculty profile."
      >
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--destructive-subtle, #fee2e2)',
                border: '1px solid var(--destructive, #ef4444)',
                borderRadius: 'var(--radius-md, 8px)',
                color: 'var(--destructive, #b91c1c)',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {formError.code && (
                  <Badge variant="destructive">
                    {formError.code}
                  </Badge>
                )}
                <span style={{ fontWeight: 700 }}>{formError.message}</span>
              </div>
              {formError.details && (
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                  {formError.details}
                </div>
              )}
              {formError.hint && (
                <div style={{ marginTop: '6px', fontWeight: 600, color: '#991b1b' }}>
                  💡 Hint: {formError.hint}
                </div>
              )}
            </div>
          )}

          {/* Gate A5 Demo / Test Helper */}
          {import.meta.env.DEV && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--muted, #f1f5f9)',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontWeight: 600 }}>Milestone 2 Gate A5: Reachable Failure Test</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                type="button"
                size="sm"
                variant={failureMode === '422_word_limit' ? 'destructive' : 'outline'}
                onClick={() => {
                  setFailureMode('422_word_limit');
                  setReviewBody('A '.repeat(505)); // 505 words to trigger word limit
                }}
              >
                Trigger 422 (Word Limit &gt;500)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={failureMode === '422_empty_body' ? 'destructive' : 'outline'}
                onClick={() => {
                  setFailureMode('422_empty_body');
                  setReviewBody('');
                }}
              >
                Trigger 422 (Empty Body)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={failureMode === 'none' ? 'secondary' : 'ghost'}
                onClick={() => {
                  setFailureMode('none');
                  setReviewBody('Demonstrated great analytical ability and project leadership in software engineering.');
                }}
              >
                Reset to Normal (201)
              </Button>
            </div>
          </div>
          )}

          <div>
            <Label htmlFor="student-id-field">Student UUID</Label>
            <Input
              id="student-id-field"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 45b54332-e470-4c21-a839-7428c4f6bf42"
              required
            />
          </div>

          <div>
            <Label htmlFor="review-body-field">Review Body Text</Label>
            <textarea
              id="review-body-field"
              className="ui-input"
              rows={5}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              placeholder="Provide constructive review comments about the student..."
              required={!(import.meta.env.DEV && failureMode === '422_empty_body')}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                border: formError ? '2px solid var(--destructive, #ef4444)' : '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: 'var(--input-bg, transparent)',
                color: 'inherit',
              }}
            />
          </div>

          <div>
            <Label htmlFor="review-tags-field">Competency Tags (comma separated)</Label>
            <Input
              id="review-tags-field"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. research, academic diligence, python"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? 'Submitting to Prism...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
