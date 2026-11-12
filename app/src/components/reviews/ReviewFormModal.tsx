import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, Badge } from '../ui';
import { reviewSchema, type ReviewFormValues } from '../../lib/validation/review';
import { countReviewWords, extractPlainText, REVIEW_WORD_LIMIT } from '../../lib/rules/review';
import { normalizeTags } from '../../lib/rules/tags';
import { ApiRequestError } from '../../lib/api';
import { useTags } from '../../hooks/useTags';
import { useCreateReview } from '../../hooks/useCreateReview';
import { useUpdateReview } from '../../hooks/useUpdateReview';
import type { Review } from '../../hooks/useStudentReviews';
import { ReviewDocumentView } from './ReviewDocumentView';
import {
  deserializeDocumentToEditorText,
  serializeEditorTextToDocument,
} from './richTextDocument';

export function getTagBadgeVariant(tag: string): 'purple' | 'rose' | 'amber' | 'cyan' | 'neutral' {
  const lower = tag.toLowerCase();
  if (lower === 'research') return 'purple';
  if (lower === 'robotics') return 'rose';
  if (lower === 'teamwork' || lower === 'leadership') return 'amber';
  if (lower === 'communication' || lower === 'algorithms') return 'cyan';
  return 'neutral';
}

export interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  studentId: string;
  allowStudentIdEdit?: boolean;
  enableDevFailureSimulator?: boolean;
  studentName?: string;
  studentIdNumber?: string;
  studentProgram?: string;
  contributorName?: string;
  initialReview?: Review | null;
  onSuccess?: (message: string, review: Review) => void;
}

export function ReviewFormModal({
  isOpen,
  onClose,
  mode,
  studentId,
  allowStudentIdEdit = false,
  enableDevFailureSimulator = false,
  studentName,
  studentIdNumber,
  studentProgram,
  contributorName = 'Alex Reyes',
  initialReview,
  onSuccess,
}: ReviewFormModalProps) {
  const initialEditorText = useMemo(
    () =>
      mode === 'edit' && initialReview
        ? deserializeDocumentToEditorText(initialReview.body_document, initialReview.body_text)
        : '',
    [mode, initialReview]
  );

  const [editorText, setEditorText] = useState(initialEditorText);
  const [tagDraft, setTagDraft] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number; type: string }>>([]);
  const [failureMode, setFailureMode] = useState<'none' | '422_word_limit' | '422_empty_body'>('none');
  const [serverError, setServerError] = useState<{
    code?: string;
    message: string;
    details?: string | null;
    hint?: string | null;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      student_id: studentId,
      body_document:
        mode === 'edit' && initialReview
          ? initialReview.body_document
          : { blocks: [{ type: 'paragraph', content: [{ text: '' }] }] },
      tags: mode === 'edit' && initialReview ? [...(initialReview.tags ?? [])] : [],
    },
  });

  const initialReviewId = initialReview?.id;
  useEffect(() => {
    if (!isOpen) return;
    const nextText =
      mode === 'edit' && initialReview
        ? deserializeDocumentToEditorText(initialReview.body_document, initialReview.body_text)
        : '';
    setEditorText(nextText);
    setTagDraft('');
    setShowSuggestions(false);
    setAttachedFiles([]);
    setFailureMode('none');
    setServerError(null);
    form.reset({
      student_id: studentId,
      body_document:
        mode === 'edit' && initialReview
          ? initialReview.body_document
          : serializeEditorTextToDocument(nextText),
      tags: mode === 'edit' && initialReview ? [...(initialReview.tags ?? [])] : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialReviewId, studentId]);

  const watchedDocument = form.watch('body_document');
  const watchedTags = form.watch('tags') ?? [];

  const plainText = useMemo(() => extractPlainText(watchedDocument), [watchedDocument]);
  const wordCount = useMemo(() => countReviewWords(plainText), [plainText]);
  const charCount = plainText.length;
  const isOverWordLimit = wordCount > REVIEW_WORD_LIMIT;

  const { data: tagSuggestionsData } = useTags({
    prefix: tagDraft.trim().toLowerCase() || undefined,
    limit: 10,
  });

  const filteredSuggestions = useMemo(() => {
    const query = tagDraft.trim().toLowerCase();
    const list = (tagSuggestionsData ?? []).map((item) => item.tag);
    return list.filter(
      (tag) => !watchedTags.includes(tag) && (!query || tag.toLowerCase().includes(query))
    );
  }, [tagSuggestionsData, watchedTags, tagDraft]);

  const handleEditorChange = (nextValue: string) => {
    setEditorText(nextValue);
    setServerError(null);
    const nextDoc = serializeEditorTextToDocument(nextValue);
    form.setValue('body_document', nextDoc, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  };

  const applyFormat = (format: 'bold' | 'italic' | 'bullet' | 'number' | 'linebreak') => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? editorText.length;
    const end = textarea?.selectionEnd ?? editorText.length;
    const selected = editorText.slice(start, end);

    let nextText = editorText;
    if (format === 'bold') {
      const target = selected || 'bold text';
      nextText = `${editorText.slice(0, start)}**${target}**${editorText.slice(end)}`;
    } else if (format === 'italic') {
      const target = selected || 'italic text';
      nextText = `${editorText.slice(0, start)}*${target}*${editorText.slice(end)}`;
    } else if (format === 'bullet') {
      if (selected) {
        const bulleted = selected
          .split('\n')
          .map((line) => (line.trim().startsWith('- ') ? line : `- ${line}`))
          .join('\n');
        nextText = `${editorText.slice(0, start)}${bulleted}${editorText.slice(end)}`;
      } else {
        const prefix = editorText && !editorText.endsWith('\n') ? '\n' : '';
        nextText = `${editorText}${prefix}- List item`;
      }
    } else if (format === 'number') {
      if (selected) {
        const numbered = selected
          .split('\n')
          .map((line, idx) => (/^\d+\.\s/.test(line.trim()) ? line : `${idx + 1}. ${line}`))
          .join('\n');
        nextText = `${editorText.slice(0, start)}${numbered}${editorText.slice(end)}`;
      } else {
        const prefix = editorText && !editorText.endsWith('\n') ? '\n' : '';
        nextText = `${editorText}${prefix}1. Numbered item`;
      }
    } else if (format === 'linebreak') {
      nextText = `${editorText.slice(0, start)}\n${editorText.slice(end)}`;
    }

    handleEditorChange(nextText);
    textarea?.focus();
  };

  const addTagsFromInput = (rawText: string) => {
    const candidates = rawText
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (candidates.length === 0) return;

    const merged = [...watchedTags, ...candidates];
    const normalized = normalizeTags(merged);
    if (!normalized.valid) {
      form.setError('tags', {
        type: 'manual',
        message:
          normalized.reason === 'too_many_tags'
            ? 'A review can have no more than 30 tags.'
            : 'Each tag must be 50 characters or fewer.',
      });
      return;
    }
    form.clearErrors('tags');
    form.setValue('tags', normalized.tags, { shouldDirty: true, shouldValidate: true });
    setTagDraft('');
    setShowSuggestions(false);
  };

  const removeTagChip = (tagToRemove: string) => {
    const next = watchedTags.filter((tag) => tag !== tagToRemove);
    form.setValue('tags', next, { shouldDirty: true, shouldValidate: true });
  };

  const createMutation = useCreateReview({
    onSuccess: (created) => {
      onClose();
      onSuccess?.('Review published successfully!', created);
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setServerError({
          code: err.code,
          message: err.message,
          details: err.details,
          hint: err.hint,
        });
      } else {
        setServerError({ message: err.message });
      }
    },
  });

  const updateMutation = useUpdateReview({
    onSuccess: (updated) => {
      onClose();
      onSuccess?.('Review updated successfully!', updated);
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setServerError({
          code: err.code,
          message: err.message,
          details: err.details,
          hint: err.hint,
        });
      } else {
        setServerError({ message: err.message });
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((validValues) => {
    setServerError(null);
    if (mode === 'edit' && initialReview) {
      updateMutation.mutate({
        id: initialReview.id,
        body: {
          body_document: validValues.body_document,
          tags: validValues.tags ?? [],
        },
      });
    } else {
      let headers: Record<string, string> | undefined;
      if (import.meta.env.DEV && enableDevFailureSimulator && failureMode === '422_word_limit') {
        headers = { Prefer: 'code=422, example=wordLimit' };
      } else if (import.meta.env.DEV && enableDevFailureSimulator && failureMode === '422_empty_body') {
        headers = { Prefer: 'code=422, example=emptyReview' };
      }

      createMutation.mutate({
        body: {
          student_id: validValues.student_id,
          body_document: validValues.body_document,
          tags: validValues.tags && validValues.tags.length > 0 ? validValues.tags : undefined,
        },
        headers,
      });
    }
  });

  const bodyFieldError =
    form.formState.errors.body_document?.message ||
    (form.formState.errors.body_document as { blocks?: { message?: string } } | undefined)?.blocks
      ?.message;
  const tagsFieldError = form.formState.errors.tags?.message;

  const existingAttachments = initialReview?.attachments ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={mode === 'edit' ? 'Edit your review' : 'Write a review'}
      description={
        mode === 'edit'
          ? 'The previous version remains in the inline edit history for anyone who can view this review. Visibility stays unchanged.'
          : 'Share an assessment grounded in your work with this student.'
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (tagDraft.trim()) {
            const merged = [...watchedTags, ...tagDraft.split(',').map((t) => t.trim()).filter(Boolean)];
            const normalized = normalizeTags(merged);
            if (normalized.valid) {
              form.setValue('tags', normalized.tags, { shouldDirty: true });
              setTagDraft('');
            }
          }
          if (import.meta.env.DEV && enableDevFailureSimulator && failureMode !== 'none') {
            let headers: Record<string, string> | undefined;
            if (failureMode === '422_word_limit') {
              headers = { Prefer: 'code=422, example=wordLimit' };
            } else if (failureMode === '422_empty_body') {
              headers = { Prefer: 'code=422, example=emptyReview' };
            }
            const values = form.getValues();
            createMutation.mutate({
              body: {
                student_id: values.student_id,
                body_document: values.body_document,
                tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
              },
              headers,
            });
            return;
          }
          void onSubmit(e);
        }}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {import.meta.env.DEV && enableDevFailureSimulator && (
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
                  handleEditorChange('A '.repeat(505));
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
                  handleEditorChange('');
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
                  handleEditorChange(
                    'Demonstrated great analytical ability and project leadership in software engineering.'
                  );
                }}
              >
                Reset to Normal (201)
              </Button>
            </div>
          </div>
        )}

        {allowStudentIdEdit && (
          <div className="ui-form-group">
            <label className="ui-form-label" htmlFor="student-id-field">
              Student UUID
            </label>
            <input
              id="student-id-field"
              className="ui-input"
              value={form.watch('student_id')}
              onChange={(e) =>
                form.setValue('student_id', e.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="e.g. 45b54332-e470-4c21-a839-7428c4f6bf42"
            />
          </div>
        )}
        {(studentName || studentIdNumber) && (
          <section className="review-student-header" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>
              {studentName || 'Student'}
            </h4>
            <p className="muted" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
              {studentIdNumber && <span data-student-id>{studentIdNumber}</span>}
              {studentIdNumber && studentProgram ? ' · ' : ''}
              {studentProgram && <span data-student-program>{studentProgram}</span>}
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--muted-foreground)' }}>
              Contributing as <strong>{contributorName}</strong>. Your identity is always visible with your review.
            </p>
          </section>
        )}

        {serverError && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-status-danger-subtle, rgba(239, 68, 68, 0.12))',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #ef4444)',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {serverError.code && <Badge variant="destructive">{serverError.code}</Badge>}
              <span style={{ fontWeight: 700 }}>{serverError.message}</span>
            </div>
            {serverError.details && (
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                {serverError.details}
              </div>
            )}
            {serverError.hint && (
              <div style={{ marginTop: '6px', fontWeight: 600 }}>
                Hint: {serverError.hint}
              </div>
            )}
          </div>
        )}

        {/* Constrained Rich-Text Editor */}
        <div className="ui-form-group">
          <label className="ui-form-label" htmlFor="review-editor-textarea">
            Review text
          </label>
          <div>
            <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting toolbar">
              <button
                type="button"
                className="toolbar-btn"
                title="Bold"
                aria-label="Bold"
                onClick={() => applyFormat('bold')}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="toolbar-btn"
                title="Italic"
                aria-label="Italic"
                onClick={() => applyFormat('italic')}
              >
                <em>I</em>
              </button>
              <div className="toolbar-divider" />
              <button
                type="button"
                className="toolbar-btn"
                title="Bulleted list"
                aria-label="Bulleted list"
                onClick={() => applyFormat('bullet')}
              >
                • List
              </button>
              <button
                type="button"
                className="toolbar-btn"
                title="Numbered list"
                aria-label="Numbered list"
                onClick={() => applyFormat('number')}
              >
                1. List
              </button>
              <button
                type="button"
                className="toolbar-btn"
                title="Line break"
                aria-label="Line break"
                onClick={() => applyFormat('linebreak')}
              >
                ↵ Break
              </button>
              <div className="toolbar-divider" />
              <button
                type="button"
                className={`toolbar-btn ${attachedFiles.length > 0 ? 'active' : ''}`.trim()}
                title="Attach files"
                aria-label="Attach files"
                onClick={() => fileInputRef.current?.click()}
              >
                📎 Attach
              </button>
              <input
                ref={fileInputRef}
                aria-label="Attach files to review"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setAttachedFiles((prev) => {
                    const next = [...prev];
                    for (const file of files) {
                      if (!next.some((item) => item.name === file.name && item.size === file.size)) {
                        next.push({ name: file.name, size: file.size, type: file.type || 'application/octet-stream' });
                      }
                    }
                    return next;
                  });
                }}
              />
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                Live formatting
              </div>
            </div>

            <textarea
              id="review-editor-textarea"
              ref={textareaRef}
              className="review-rich-editor"
              rows={6}
              value={editorText}
              onChange={(e) => handleEditorChange(e.target.value)}
              placeholder="Describe how you worked with this student and what you observed."
              aria-invalid={Boolean(bodyFieldError || isOverWordLimit)}
              style={{
                width: '100%',
                display: 'block',
                resize: 'vertical',
                borderColor: bodyFieldError || isOverWordLimit ? 'var(--destructive, #ef4444)' : undefined,
              }}
            />
          </div>

          {/* Live rich-text preview when formatting blocks are used */}
          {plainText.length > 0 && (
            <div
              aria-label="Formatted review preview"
              style={{
                marginTop: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px dashed var(--border)',
                backgroundColor: 'var(--color-card-subtle, var(--muted))',
                fontSize: '13px',
              }}
            >
              <small style={{ display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Formatted preview
              </small>
              <ReviewDocumentView document={watchedDocument} />
            </div>
          )}

          {/* Attachment Metadata Display (Existing contract attachments + newly selected files) */}
          {(existingAttachments.length > 0 || attachedFiles.length > 0) && (
            <div
              aria-label="Review attachments"
              style={{
                marginTop: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px dashed var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                  Attachments ({existingAttachments.length + attachedFiles.length})
                </span>
                {attachedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAttachedFiles([])}
                    style={{
                      fontSize: '12px',
                      color: 'var(--destructive)',
                      textDecoration: 'underline',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Remove attached files
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {existingAttachments.map((att) => (
                  <Badge key={att.id} variant="neutral">
                    📎 {att.mime_type} ({(att.size_bytes / 1024).toFixed(1)} KB)
                  </Badge>
                ))}
                {attachedFiles.map((file, idx) => (
                  <Badge key={`${file.name}-${idx}`} variant="neutral">
                    <span>
                      📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove attachment ${file.name}`}
                      onClick={() =>
                        setAttachedFiles((prev) => prev.filter((_, index) => index !== idx))
                      }
                      style={{ marginLeft: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <small className="muted">Constructive feedback grounded in student coursework.</small>
            <small
              data-testid="review-word-counter"
              className={isOverWordLimit ? 'word-count-over' : 'muted'}
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: isOverWordLimit ? 'var(--destructive, #ef4444)' : undefined,
                fontWeight: isOverWordLimit ? 700 : undefined,
              }}
            >
              <span>{wordCount} / {REVIEW_WORD_LIMIT} words</span>{' '}
              <span style={{ opacity: 0.75 }}>({charCount} chars)</span>
            </small>
          </div>

          {bodyFieldError && (
            <p role="alert" style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--destructive, #ef4444)', fontWeight: 600 }}>
              {bodyFieldError}
            </p>
          )}
        </div>

        {/* Tag Chip Input + Autocomplete */}
        <div className="ui-form-group" style={{ position: 'relative' }}>
          <label className="ui-form-label" htmlFor="review-tag-input">
            Tags <span style={{ fontWeight: 400, color: 'var(--muted-foreground)' }}>(optional)</span>
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: 'var(--background)',
              border: '1px solid var(--input)',
              borderRadius: 'var(--radius-md, 10px)',
              minHeight: '42px',
            }}
          >
            {watchedTags.map((tag) => (
              <Badge key={tag} variant={getTagBadgeVariant(tag)}>
                <span>#{tag}</span>
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => removeTagChip(tag)}
                  style={{ marginLeft: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
                >
                  &times;
                </button>
              </Badge>
            ))}
            <input
              id="review-tag-input"
              type="text"
              value={tagDraft}
              placeholder="Type comma-separated tags or choose from suggestions..."
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150);
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes(',')) {
                  addTagsFromInput(val);
                } else {
                  setTagDraft(val);
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagDraft.trim()) {
                  e.preventDefault();
                  addTagsFromInput(tagDraft);
                } else if (e.key === 'Backspace' && !tagDraft && watchedTags.length > 0) {
                  removeTagChip(watchedTags[watchedTags.length - 1]);
                }
              }}
              style={{
                flex: 1,
                minWidth: '160px',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                outline: 'none',
                fontSize: '13px',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {showSuggestions && (filteredSuggestions.length > 0 || tagDraft.trim()) && (
            <div
              role="listbox"
              aria-label="Tag suggestions"
              style={{
                marginTop: '4px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md, 10px)',
                boxShadow: 'var(--shadow-md)',
                maxHeight: '180px',
                overflowY: 'auto',
                zIndex: 50,
              }}
            >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTagsFromInput(suggestion);
                  }}
                  onClick={() => addTagsFromInput(suggestion)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>#{suggestion}</span>
                  <Badge variant={getTagBadgeVariant(suggestion)}>suggested</Badge>
                </button>
              ))}
              {tagDraft.trim() && !filteredSuggestions.includes(tagDraft.trim().toLowerCase()) && (
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTagsFromInput(tagDraft);
                  }}
                  onClick={() => addTagsFromInput(tagDraft)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  + Add tag &quot;{tagDraft.trim().toLowerCase()}&quot;
                </button>
              )}
            </div>
          )}

          <small className="muted" style={{ marginTop: '2px' }}>
            Select from suggestions or type tags separated by commas and press Enter.
          </small>

          {tagsFieldError && (
            <p role="alert" style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--destructive, #ef4444)', fontWeight: 600 }}>
              {tagsFieldError}
            </p>
          )}
        </div>

        <p className="muted" style={{ margin: 0, fontSize: '12px' }}>
          {mode === 'edit'
            ? 'A review update is active immediately. You can view previous versions in edit history from the student page.'
            : 'A new review is active immediately. You can edit, hide, or delete your own review from the student page.'}
        </p>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending
              ? mode === 'edit'
                ? 'Saving changes...'
                : 'Publishing...'
              : mode === 'edit'
                ? 'Save changes'
                : 'Publish review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
