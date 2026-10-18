import React, { useEffect, useId, useRef, useState } from 'react';
import { Button } from './Button';
import { Label } from './Label';
import { Textarea } from './Input';

export interface RejectionRowProps {
  colSpan?: number;
  asTableRow?: boolean;
  standalone?: boolean;
  bulkCount?: number;
  initialReason?: string;
  className?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectionRow({
  colSpan = 6,
  asTableRow = false,
  standalone = false,
  bulkCount,
  initialReason = '',
  className = '',
  onCancel,
  onConfirm,
}: RejectionRowProps) {
  const [reason, setReason] = useState(initialReason);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reasonId = useId();

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleSubmit = () => {
    const el = textareaRef.current;
    if (!reason.trim()) {
      el?.setCustomValidity('Enter a reason for rejection.');
      el?.reportValidity();
      return;
    }
    onConfirm(reason.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
    }
  };

  const innerContent = (
    <>
      <Label htmlFor={reasonId} className="ui-queue-rejection-label">Reason for rejection</Label>
      {bulkCount && bulkCount > 1 ? (
        <p className="ui-queue-bulk-message">
          The same reason applies to all {bulkCount} selected applications.
        </p>
      ) : null}
      <Textarea
        id={reasonId}
        ref={textareaRef}
        aria-label="Reason for rejection"
        className="ui-queue-rejection-textarea"
        placeholder="Enter reason here..."
        required
        aria-required="true"
        value={reason}
        onChange={(e) => {
          e.target.setCustomValidity('');
          setReason(e.target.value);
        }}
      />
      <div className="ui-queue-rejection-actions">
        <Button
          variant="outline"
          className="ui-queue-cancel"
          onClick={onCancel}
        >
          Close
        </Button>
        <Button
          variant="destructive"
          className="ui-queue-confirm-reject"
          onClick={handleSubmit}
        >
          Reject
        </Button>
      </div>
    </>
  );

  if (asTableRow) {
    return (
      <tr
        className={`ui-queue-rejection-row is-expanded ${className}`.trim()}
        onKeyDown={handleKeyDown}
      >
        <td colSpan={colSpan} className="ui-queue-rejection-cell" style={{ width: '100%' }}>
          {innerContent}
        </td>
      </tr>
    );
  }

  if (standalone) {
    return (
      <div
        className={`ui-queue-rejection-row ui-queue-rejection-standalone is-expanded ${className}`.trim()}
        role="region"
        aria-label="Rejection review panel"
        data-bulk-rejection={bulkCount && bulkCount > 1 ? 'true' : undefined}
        onKeyDown={handleKeyDown}
      >
        <div className="ui-queue-rejection-cell ui-queue-rejection-cell--standalone">
          {innerContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ui-queue-rejection-row is-expanded ${className}`.trim()}
      role="row"
      data-bulk-rejection={bulkCount && bulkCount > 1 ? 'true' : undefined}
      style={{ width: '100%', flex: '1 1 100%', gridColumn: '1 / -1' }}
      onKeyDown={handleKeyDown}
    >
      <div className="ui-queue-rejection-cell" role="cell" style={{ width: '100%' }}>
        {innerContent}
      </div>
    </div>
  );
}

