import { useEffect, useRef, useState, type ReactNode, type FormEventHandler } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { TypographyHeading, TypographyText } from './Typography';
import { Alert, ShowcaseGroupCard } from './ShowcaseWidgets';
import { useQueueSearchParam, type QueueType } from '../queue-modal';

function usePortalFocus(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]',
    ) ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [open]);
  return ref;
}

export interface AdminEntityModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

export function AdminEntityModal({ open, onClose, onSuccess, title = 'Add Department', subtitle = 'Enter the official department title below.', children, onSubmit }: AdminEntityModalProps) {
  const [adminDeptName, setAdminDeptName] = useState('Department of Artificial Intelligence');
  const modalRef = usePortalFocus(open, onClose);

  return (
    <div
      className={`modal-overlay ${open ? 'active' : ''}`}
      id="demoAdminModal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demoAdminModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title" id="demoAdminModalTitle">
              {title}
            </h2>
            <p className="modal-subtitle">{subtitle}</p>
          </div>
        </div>
        <form
          className="modal-form"
          id="demoAdminForm"
          onSubmit={onSubmit ?? ((e) => {
            e.preventDefault();
            onClose();
            onSuccess?.('Department record saved successfully.');
          })}
        >
          {children ?? <>
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
          </>}
        </form>
      </section>
    </div>
  );
}

export interface RemoveConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  entityLabel?: string;
  pending?: boolean;
  error?: ReactNode;
  closeOnConfirm?: boolean;
}

export function RemoveConfirmationModal({
  open,
  onClose,
  onConfirm,
  entityLabel = 'Department',
  pending = false,
  error,
  closeOnConfirm = true,
}: RemoveConfirmationModalProps) {
  const modalRef = usePortalFocus(open, onClose);
  return (
    <div
      className={`modal-overlay ${open ? 'active' : ''}`}
      id="demoRemoveModal"
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demoRemoveModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card compact remove-modal">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title" id="demoRemoveModalTitle">Remove {entityLabel}</h2>
            <p className="modal-subtitle">Confirm permanent deletion of this record.</p>
          </div>
        </div>
        <div className="modal-body">
          <Alert
            variant="warning"
            title="Confirm Removal"
            description={`Are you sure you want to remove this ${entityLabel.toLowerCase()}? This action cannot be undone.`}
          />
          {error}
          <div className="modal-actions">
            <Button
              disabled={pending}
              id="cancelDemoRemoveModal"
              variant="outline"
              className="modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="confirmDemoRemoveModal"
              disabled={pending}
              variant="primary"
              className="modal-submit"
              onClick={() => {
                if (closeOnConfirm) onClose();
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

export interface ModalTriggerLaunchpadProps {
  onOpenAdminModal: () => void;
  onOpenRemoveModal: () => void;
  onOpenFacultyModal: () => void;
  onOpenLogoutModal: () => void;
  onOpenQueue?: (queue: QueueType) => void;
}

export function ModalTriggerLaunchpad({
  onOpenAdminModal,
  onOpenRemoveModal,
  onOpenFacultyModal,
  onOpenLogoutModal,
  onOpenQueue,
}: ModalTriggerLaunchpadProps) {
  const { openQueue } = useQueueSearchParam();
  const handleQueueOpen = onOpenQueue ?? openQueue;

  return (
    <Card className="is-03e275d">
      <div className="ui-modal-card-header">
        <TypographyHeading level={3} className="ui-modal-card-heading">
          Modal Trigger Buttons
        </TypographyHeading>
        <TypographyText variant="caption" className="ui-modal-card-sub">
          Consolidated launchpad gathering all buttons that trigger modal overlays across Admin, Faculty, and Approval Queue workflows.
        </TypographyText>
      </div>

      <ShowcaseGroupCard
        label="Admin Portal Modals (<AdminEntityModal /> & <RemoveConfirmationModal />)"
        caption={
          <>
            Triggers the entity creation modal (<code>.modal-card</code>) or destructive removal confirmation modal (<code>.modal-card.compact.remove-modal</code>).
          </>
        }
        style={{ marginBottom: '14px' }}
      >
        <Button id="demo-open-admin-modal-btn" variant="add" className="is-ebaa71c" onClick={onOpenAdminModal}>
          Open Admin Modal
        </Button>
        <Button id="demo-open-remove-modal-btn" variant="outline" className="is-ebaa71c" onClick={onOpenRemoveModal}>
          Open Remove Modal
        </Button>
      </ShowcaseGroupCard>

      <ShowcaseGroupCard
        label="Faculty Portal Modals (<FacultyProposalDialog />)"
        caption={
          <>
            Triggers the native HTML5 dialog modal (<code>&lt;dialog class=&quot;proposal-modal&quot;&gt;</code>) for department or curriculum proposals.
          </>
        }
        style={{ marginBottom: '14px' }}
      >
        <Button id="demo-open-faculty-modal-btn" variant="add" className="is-ebaa71c" onClick={onOpenFacultyModal}>
          Open Faculty Modal
        </Button>
      </ShowcaseGroupCard>

      <ShowcaseGroupCard
        label="Approval Queue Modals (URL Route-Backed <QueueModal />)"
        caption={
          <>
            Opens <code>&lt;QueueModal /&gt;</code> synchronized with <code>?queue=department|program|student|faculty</code> for URL parameter routing and browser history.
          </>
        }
        style={{ marginBottom: '14px' }}
      >
        <Button variant="add" className="is-ebaa71c" onClick={() => handleQueueOpen('department')}>
          Department Queue
        </Button>
        <Button variant="outline" className="is-ebaa71c" onClick={() => handleQueueOpen('program')}>
          Program Queue
        </Button>
        <Button variant="outline" className="is-ebaa71c" onClick={() => handleQueueOpen('student')}>
          Student Queue
        </Button>
        <Button variant="outline" className="is-ebaa71c" onClick={() => handleQueueOpen('faculty')}>
          Faculty Queue
        </Button>
      </ShowcaseGroupCard>

      <ShowcaseGroupCard
        label="Session & Security Dialogs (<LogoutModal />)"
        caption={
          <>
            Triggers the session termination confirmation dialog (<code>&lt;dialog class=&quot;ui-logout-dialog&quot;&gt;</code>) before signing out.
          </>
        }
      >
        <Button
          id="demo-open-logout-btn"
          variant="outline"
          className="is-ebaa71c"
          data-open-logout-demo
          onClick={onOpenLogoutModal}
        >
          Open Logout Dialog
        </Button>
      </ShowcaseGroupCard>
    </Card>
  );
}

export interface PortalModalArchitectureCardProps {
  showAlerts?: boolean;
}

export function PortalModalArchitectureCard({ showAlerts = true }: PortalModalArchitectureCardProps) {
  return (
    <Card className="is-03e275d">
      <div className="ui-modal-card-header">
        <TypographyHeading level={3} className="ui-modal-card-heading">
          Standard Portal Modal Architecture
        </TypographyHeading>
        <TypographyText variant="caption" className="ui-modal-card-sub">
          Shared architecture across Admin Portal (<code>.modal-card</code>) and Faculty Portal (<code>&lt;dialog&gt;</code>).
        </TypographyText>
      </div>

      <div className="ui-table-wrap ui-modal-arch-table-wrap">
        <table className="ui-modal-arch-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Height</th>
              <th>Padding / Radius</th>
              <th>Typography</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="ui-modal-arch-role">Cancel / Secondary</td>
              <td><code>36px</code></td>
              <td><code>0 16px</code> &middot; <code>8px</code></td>
              <td>13px (600)</td>
            </tr>
            <tr>
              <td className="ui-modal-arch-role">Submit / Confirm</td>
              <td><code>36px</code></td>
              <td><code>0 16px</code> &middot; <code>8px</code></td>
              <td>13px (700)</td>
            </tr>
            <tr>
              <td className="ui-modal-arch-role">Queue Bulk Pill</td>
              <td><code>32px</code></td>
              <td><code>0 20px</code> &middot; <code>9999px</code></td>
              <td>13px (600)</td>
            </tr>
            <tr>
              <td className="ui-modal-arch-role">Squircle Close</td>
              <td><code>32&times;32px</code></td>
              <td><code>0</code> &middot; <code>8px</code></td>
              <td>18px Icon</td>
            </tr>
          </tbody>
        </table>
      </div>

      <TypographyHeading level={4} className="ui-modal-arch-contract-title">
        Modal Accessibility &amp; Sizing Contract:
      </TypographyHeading>
      <ul className="is-1afd29d ui-modal-arch-list">
        <li>
          <strong>Strict 36px Action Button Height:</strong> Both primary and outline buttons enforce{' '}
          <code>height: 36px !important</code> with <code>width: auto !important</code> and <code>padding: 0 16px</code>.
        </li>
        <li>
          <strong>No Redundant Close &apos;X&apos; Button:</strong> When a modal provides an explicit{' '}
          <strong>Cancel</strong> outline button in <code>.modal-actions</code>, the top-right &apos;X&apos; button is omitted/hidden (<code>display: none</code>) to eliminate clutter.
        </li>
        <li>
          <strong>Escape &amp; Backdrop Dismissal:</strong> Pressing <kbd className="is-48badad">Esc</kbd> or clicking the dimmed backdrop immediately dismisses the modal.
        </li>
        <li>
          <strong>Zero Nested Modals Directive:</strong> No modal may open on top of another modal. In approval queues, rejections expand inline directly inside the queue table row.
        </li>
      </ul>

      {showAlerts && (
        <div className="ui-modal-arch-alerts">
          <TypographyText variant="label">Alert Banner Primitives (&lt;Alert /&gt;)</TypographyText>
          <Alert
            variant="info"
            title="Confirm Addition"
            description="You are about to add this department record. Review the details below before proceeding."
          />
          <Alert
            variant="warning"
            title="Confirm Removal"
            description="Are you sure you want to remove this department? This action cannot be undone."
          />
        </div>
      )}
    </Card>
  );
}

