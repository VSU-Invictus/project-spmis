import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QUEUE_PARAM, isQueueType, type QueueType } from './queues';

/**
 * Binds the approval-queue modal to the `?queue=<type>` URL parameter.
 *
 * Opening/closing pushes a history entry (mirrors the vanilla pushState
 * behaviour), so browser Back/Forward reopens or dismisses the modal.
 * Invalid values are treated as "closed".
 */
export function useQueueSearchParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(QUEUE_PARAM);
  const queue: QueueType | null = isQueueType(raw) ? raw : null;

  const openQueue = useCallback(
    (next: QueueType) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set(QUEUE_PARAM, next);
        return params;
      });
    },
    [setSearchParams]
  );

  const closeQueue = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete(QUEUE_PARAM);
      return params;
    });
  }, [setSearchParams]);

  return { queue, openQueue, closeQueue } as const;
}

