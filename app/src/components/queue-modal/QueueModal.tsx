import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './QueueModal.css';

const FOCUSABLE =
  'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export interface QueueModalProps {
  /** Controlled open state. */
  open: boolean;
  /** Called on close button, Escape, or backdrop click. */
  onClose: () => void;
  /** Accessible title (rendered visually by the content). */
  title: string;
  children: ReactNode;
}

/**
 * Controlled approval-queue modal (port of mockup/assets/js/queue-modal.js).
 * Focus is trapped while open and restored to the trigger on close.
 * Pair with `useQueueSearchParam` for URL-backed state.
 */
export function QueueModal({ open, onClose, title, children }: QueueModalProps) {
  const containerRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    containerRef.current?.querySelector<HTMLElement>('[data-queue-close]')?.focus();

    return () => {
      document.body.style.overflow = overflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Inline rejection panels handle their own Escape first.
      if (event.defaultPrevented) return;
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab' || !containerRef.current) return;
    const focusable = [...containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !el.hasAttribute('disabled')
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="modal-overlay active show queue-modal-overlay"
      data-queue-modal=""
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section
        ref={containerRef}
        className="modal-container queue-modal-container"
        role="document"
      >
        <h2 id={titleId} className="queue-modal-sr-title">
          {title}
        </h2>
        <button
          type="button"
          className="modal-close modal-cancel ui-modal-close"
          data-queue-close=""
          aria-label="Close queue modal"
          onClick={() => onCloseRef.current()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="queue-modal-body" data-queue-modal-body>
          {children}
        </div>
      </section>
    </div>,
    document.body
  );
}
