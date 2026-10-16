import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface LogoutModalProps {
  open?: boolean;
  role?: 'admin' | 'faculty';
  syncWithUrl?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function LogoutModal({
  open: controlledOpen,
  role = 'admin',
  syncWithUrl = false,
  onCancel,
  onConfirm,
}: LogoutModalProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const urlRequested = syncWithUrl && searchParams.get('logout') === 'true';
  const isOpen = controlledOpen !== undefined ? controlledOpen : urlRequested;

  const clearUrlParam = () => {
    if (!syncWithUrl) return;
    if (searchParams.has('logout')) {
      const next = new URLSearchParams(searchParams);
      next.delete('logout');
      setSearchParams(next, { replace: true });
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => cancelBtnRef.current?.focus(), 0);
      }
    } else if (dialog.open) {
      dialog.close('cancel');
    }
  }, [isOpen]);

  const handleDismiss = () => {
    clearUrlParam();
    onCancel?.();
  };

  const handleConfirm = () => {
    clearUrlParam();
    if (role === 'faculty') {
      try {
        window.sessionStorage.removeItem('faculty-demo-v1');
        window.sessionStorage.removeItem('faculty-sidebar-collapsed');
      } catch {
        // Ignore sessionStorage restrictions
      }
    }
    onConfirm?.();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      handleDismiss();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="ui-logout-dialog"
      aria-labelledby="ui-logout-title"
      aria-describedby="ui-logout-description"
      onCancel={(e) => {
        e.preventDefault();
        handleDismiss();
      }}
      onClick={handleBackdropClick}
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <h2 id="ui-logout-title" className="ui-logout-title">
          Log out?
        </h2>
        <p id="ui-logout-description" className="ui-logout-description">
          Are you sure you want to end your {role} session? You will return to the sign-in page.
        </p>
        <div className="ui-logout-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            value="cancel"
            className="ui-btn ui-btn-outline"
            onClick={handleDismiss}
          >
            Cancel
          </button>
          <button
            type="button"
            value="confirm"
            className="ui-btn ui-btn-primary"
            onClick={handleConfirm}
          >
            Log out
          </button>
        </div>
      </form>
    </dialog>
  );
}

