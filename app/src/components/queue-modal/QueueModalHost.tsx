import { useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { ApplicationQueue } from '../application-queue/ApplicationQueue';
import { QueueModal } from './QueueModal';
import { QUEUE_TITLES } from './queues';
import { useQueueSearchParam } from './useQueueSearchParam';

/**
 * Mount once in the admin layout: any admin route with `?queue=<type>`
 * shows the matching approval queue in <QueueModal />.
 */
export function QueueModalHost() {
  const { queue, closeQueue } = useQueueSearchParam();
  const { role, loading } = useSession();
  const { pathname } = useLocation();
  if (loading || role !== 'admin' || !pathname.startsWith('/admin/')) return null;
  return (
    <QueueModal open={queue !== null} onClose={closeQueue} title={queue ? QUEUE_TITLES[queue] : ''}>
      {queue && <ApplicationQueue key={queue} type={queue} isModal={true} />}
    </QueueModal>
  );
}
