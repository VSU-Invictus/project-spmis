import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    // Lock body scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal or first focusable element
    const timer = setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeMaxWidth = 
    size === 'sm' ? '420px' :
    size === 'lg' ? '760px' :
    size === 'xl' ? '960px' :
    size === 'full' ? '95vw' : '580px';

  const modalContent = (
    <div
      className="ui-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal, 1000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="ui-modal-card"
        style={{
          width: '100%',
          maxWidth: sizeMaxWidth,
          backgroundColor: 'var(--color-card, var(--card, #2B2A27))',
          color: 'var(--color-text-main, var(--foreground, #FFFFFF))',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-border-main, var(--border, #383734))',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          outline: 'none',
        }}
      >
        {(title || description) && (
          <div
            className="ui-modal-header"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid var(--color-border-subtle, var(--border, #383734))',
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-xl, 18px)',
                    fontWeight: 700,
                    color: 'var(--color-text-title, var(--foreground, #FAF9F5))',
                  }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 'var(--font-size-sm, 12px)',
                    color: 'var(--color-text-muted, var(--muted-foreground, #A0988E))',
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="ui-modal-close-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted, #A0988E)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>
        )}

        <div
          className="ui-modal-body"
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="ui-modal-footer"
            style={{
              padding: '14px 22px',
              borderTop: '1px solid var(--color-border-subtle, var(--border, #383734))',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--color-card-subtle, var(--muted, #1F1E1D))',
              borderBottomLeftRadius: 'var(--radius-xl, 16px)',
              borderBottomRightRadius: 'var(--radius-xl, 16px)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

