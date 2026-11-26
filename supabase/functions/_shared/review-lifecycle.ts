export type ReviewStatus = 'active' | 'hidden' | 'deleted';
export type ReviewStatusAction = 'hide' | 'unhide' | 'delete';

export function nextReviewStatus(
  action: ReviewStatusAction,
  status: ReviewStatus,
): ReviewStatus | null {
  if (action === 'hide' && status === 'active') return 'hidden';
  if (action === 'unhide' && status === 'hidden') return 'active';
  if (action === 'delete' && (status === 'active' || status === 'hidden')) return 'deleted';
  return null;
}

export function embeddingAfterStatusChange(action: ReviewStatusAction): 'embed' | 'remove' {
  return action === 'unhide' ? 'embed' : 'remove';
}
