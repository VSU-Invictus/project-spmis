import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Alert } from './ShowcaseWidgets';

export interface AdminEntityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function AdminEntityModal({ open, onClose, onSuccess }: AdminEntityModalProps) {
  const [adminDeptName, setAdminDeptName] = useState('Department of Artificial Intelligence');

  return (
    <div
      className={`modal-overlay ${open ? 'active' : ''}`}
      id="demoAdminModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title" id="demoAdminModalTitle">
              Add Department
            </h2>
            <p className="modal-subtitle">Enter the official department title below.</p>
          </div>
        </div>
        <form
          className="modal-form"
          id="demoAdminForm"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            onSuccess?.('Department record saved successfully.');
          }}
        >
          <Alert
            variant="info"
            title="Confirm Addition"
            description="You are about to add this department record. Review the details below before proceeding."
          />
          <Input
            id="demoAdminDeptName"
            label="Department Name"
            placeholder="e.g. Department of Computer Science"
            required
            value={adminDeptName}
            onChange={(e) => setAdminDeptName(e.target.value)}
          />
          <div className="modal-actions">
            <Button
              id="cancelDemoAdminModal"
              variant="outline"
              className="modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="modal-submit">
              Add Department
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export interface RemoveConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function RemoveConfirmationModal({
  open,
  onClose,
  onConfirm,
}: RemoveConfirmationModalProps) {
  return (
    <div
      className={`modal-overlay ${open ? 'active' : ''}`}
      id="demoRemoveModal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card compact remove-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">Remove Department</h2>
            <p className="modal-subtitle">Confirm permanent deletion of this record.</p>
          </div>
        </div>
        <div className="modal-body">
          <Alert
            variant="warning"
            title="Confirm Removal"
            description="Are you sure you want to remove this department? This action cannot be undone."
          />
          <div className="modal-actions">
            <Button
              id="cancelDemoRemoveModal"
              variant="outline"
              className="modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="confirmDemoRemoveModal"
              variant="primary"
              className="modal-submit"
              onClick={() => {
                onClose();
                onConfirm?.();
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export interface FacultyProposalDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function FacultyProposalDialog({
  open,
  onClose,
  onSuccess,
}: FacultyProposalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [facultyDeptName, setFacultyDeptName] = useState('Department of Quantum Computing');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute('open', '');
        }
      }
    } else if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="demoFacultyModal"
      className="proposal-modal"
      aria-labelledby="demoFacultyTitle"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-header">
        <div className="modal-header-content">
          <h2 className="modal-title" id="demoFacultyTitle">
            Propose a department
          </h2>
          <p className="modal-subtitle">
            Your request will be pending until reviewed by an administrator.
          </p>
        </div>
      </div>
      <div className="modal-body">
        <form
          id="demoFacultyForm"
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
            onSuccess?.('Proposal submitted to administrator queue.');
          }}
        >
          <Input
            id="demoFacultyDeptName"
            label="Proposed name"
            required
            maxLength={120}
            placeholder="e.g. Department of Computer Science"
            autoComplete="off"
            value={facultyDeptName}
            onChange={(e) => setFacultyDeptName(e.target.value)}
          />
          <div className="modal-actions">
            <Button
              variant="outline"
              id="cancelDemoFacultyModal"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" id="submitDemoFacultyModal">
              Submit application
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
