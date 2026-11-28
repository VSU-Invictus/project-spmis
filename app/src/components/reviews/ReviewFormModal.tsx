import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  deserializeDocumentToEditorHtml,
  deserializeDocumentToEditorText,
  serializeEditorDomToDocument,
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

export function formatShortProgramName(program?: string): string {
  if (!program) return '';
  return program
    .replace(/^Bachelor of Science in\s+/i, 'BS ')
    .replace(/^Bachelor of Arts in\s+/i, 'BA ')
    .replace(/^BS in\s+/i, 'BS ')
    .replace(/^BA in\s+/i, 'BA ');
}

export interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  asPage?: boolean;
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
  asPage = false,
  studentId,
  allowStudentIdEdit = false,
  enableDevFailureSimulator = false,
  studentName,
  studentIdNumber,
  studentProgram,
  contributorName = 'Faculty Member',
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
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    bullet: boolean;
    number: boolean;
  }>({ bold: false, italic: false, bullet: false, number: false });
  const [tagDraft, setTagDraft] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [failureMode, setFailureMode] = useState<'none' | '422_word_limit' | '422_empty_body'>('none');
  const [serverError, setServerError] = useState<{
    code?: string;
    message: string;
    details?: string | null;
    hint?: string | null;
  } | null>(null);

  const editorDivRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

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

  const syncEmptyDataset = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const hasListOrStructure = Boolean(el.querySelector('ul, ol, li'));
    const text = (el.textContent ?? '').replace(/[\n\r\t\u200B-\u200D\uFEFF]/g, '').trim();
    const html = el.innerHTML.trim();
    const isEmpty =
      !hasListOrStructure &&
      text.length === 0 &&
      (!html || html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>');
    if (isEmpty) {
      el.dataset.empty = 'true';
    } else {
      delete el.dataset.empty;
    }
  }, []);

  const updateToolbarActiveState = useCallback(() => {
    if (typeof document === 'undefined' || typeof document.queryCommandState !== 'function') {
      return;
    }
    try {
      setActiveFormats({
        bold: Boolean(document.queryCommandState('bold')),
        italic: Boolean(document.queryCommandState('italic')),
        bullet: Boolean(document.queryCommandState('insertUnorderedList')),
        number: Boolean(document.queryCommandState('insertOrderedList')),
      });
    } catch {
      // Ignore queryCommandState errors in non-browser/jsdom environments
    }
  }, []);

  const initialReviewId = initialReview?.id;
  useEffect(() => {
    if (!isOpen) return;
    const nextText =
      mode === 'edit' && initialReview
        ? deserializeDocumentToEditorText(initialReview.body_document, initialReview.body_text)
        : '';
    const nextHtml =
      mode === 'edit' && initialReview
        ? deserializeDocumentToEditorHtml(initialReview.body_document, initialReview.body_text)
        : '';
    setEditorText(nextText);
    setActiveFormats({ bold: false, italic: false, bullet: false, number: false });
    setTagDraft('');
    setShowSuggestions(false);
    setAttachedFiles([]);
    setFailureMode('none');
    setServerError(null);
    if (editorDivRef.current) {
      editorDivRef.current.innerHTML = nextHtml;
      syncEmptyDataset(editorDivRef.current);
    }
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

  const normalizedTagPrefix = useMemo(() => {
    const token =
      tagDraft
        .trim()
        .toLowerCase()
        .split(/[\s,]+/)
        .filter(Boolean)
        .pop() ?? '';
    return token.slice(0, 50);
  }, [tagDraft]);

  const { data: tagSuggestionsData } = useTags(
    {
      prefix: normalizedTagPrefix || undefined,
      limit: 10,
    },
    {
      enabled: isOpen,
    }
  );

  const filteredSuggestions = useMemo(() => {
    const list = (tagSuggestionsData ?? []).map((item) => item.tag);
    return list.filter(
      (tag) =>
        !watchedTags.includes(tag) &&
        (!normalizedTagPrefix || tag.toLowerCase().includes(normalizedTagPrefix))
    );
  }, [tagSuggestionsData, watchedTags, normalizedTagPrefix]);

  const normalizedDraftTag = useMemo(
    () => tagDraft.trim().toLowerCase().replace(/\s+/gu, ' '),
    [tagDraft]
  );
  const canQuickAddDraftTag =
    Boolean(normalizedDraftTag) &&
    !watchedTags.includes(normalizedDraftTag) &&
    !filteredSuggestions.includes(normalizedDraftTag);

  const handleEditorChange = useCallback(
    (nextValue: string, syncDomHtml = false) => {
      setEditorText(nextValue);
      setServerError(null);
      const nextDoc = serializeEditorTextToDocument(nextValue);
      if (syncDomHtml && editorDivRef.current) {
        editorDivRef.current.innerHTML = nextValue
          ? deserializeDocumentToEditorHtml(nextDoc, nextValue)
          : '';
        syncEmptyDataset(editorDivRef.current);
      }
      form.setValue('body_document', nextDoc, {
        shouldDirty: true,
        shouldValidate: form.formState.isSubmitted,
      });
    },
    [form, syncEmptyDataset]
  );

  const syncFromContentEditable = useCallback(() => {
    const el = editorDivRef.current;
    if (!el) return;
    syncEmptyDataset(el);
    const nextDocument = serializeEditorDomToDocument(el);
    setEditorText(extractPlainText(nextDocument));
    setServerError(null);
    form.setValue('body_document', nextDocument, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
  }, [form, syncEmptyDataset]);

  const applyFormat = (format: 'bold' | 'italic' | 'bullet' | 'number') => {
    const el = editorDivRef.current;
    if (!el) return;
    el.focus();

    let executedNatively = false;
    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      try {
        if (format === 'bold') {
          executedNatively = document.execCommand('bold', false);
        } else if (format === 'italic') {
          executedNatively = document.execCommand('italic', false);
        } else if (format === 'bullet') {
          executedNatively = document.execCommand('insertUnorderedList', false);
        } else if (format === 'number') {
          executedNatively = document.execCommand('insertOrderedList', false);
        }
      } catch {
        executedNatively = false;
      }
    }

    if (executedNatively) {
      updateToolbarActiveState();
      syncFromContentEditable();
      return;
    }

    // Fallback for environments where document.execCommand is unsupported (e.g. jsdom unit tests)
    const selection = typeof window !== 'undefined' ? window.getSelection?.() : null;
    const selectedText =
      selection && selection.rangeCount > 0 && el.contains(selection.anchorNode)
        ? selection.toString()
        : '';

    if (format === 'bold') {
      const strong = document.createElement('strong');
      strong.textContent = selectedText || 'bold text';
      if (selection && selection.rangeCount > 0 && selectedText && el.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(strong);
      } else {
        el.appendChild(strong);
      }
      setActiveFormats((prev) => ({ ...prev, bold: !prev.bold }));
    } else if (format === 'italic') {
      const em = document.createElement('em');
      em.textContent = selectedText || 'italic text';
      if (selection && selection.rangeCount > 0 && selectedText && el.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(em);
      } else {
        el.appendChild(em);
      }
      setActiveFormats((prev) => ({ ...prev, italic: !prev.italic }));
    } else if (format === 'bullet') {
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      li.textContent = selectedText || 'List item';
      ul.appendChild(li);
      el.appendChild(ul);
      setActiveFormats((prev) => ({ ...prev, bullet: !prev.bullet, number: false }));
    } else if (format === 'number') {
      const ol = document.createElement('ol');
      const li = document.createElement('li');
      li.textContent = selectedText || 'Numbered item';
      ol.appendChild(li);
      el.appendChild(ol);
      setActiveFormats((prev) => ({ ...prev, number: !prev.number, bullet: false }));
    }

    syncFromContentEditable();
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
  const shortStudentProgram = useMemo(
    () => formatShortProgramName(studentProgram),
    [studentProgram]
  );

  const formElement = (
    <form
      id="review-form"
      className={asPage ? 'narrow ui-card' : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        if (tagDraft.trim()) {
          const merged = [...watchedTags, ...tagDraft.split(',').map((t) => t.trim()).filter(Boolean)];
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
                handleEditorChange('A '.repeat(505), true);
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
                handleEditorChange('', true);
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
                  'Demonstrated great analytical ability and project leadership in software engineering.',
                  true
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
        <>
          <section className="review-student-header">
            <h2 data-student-name style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--foreground)' }}>
              {studentName || 'Student'}
            </h2>
            <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
              {studentIdNumber && <span data-student-id>{studentIdNumber}</span>}
              {studentIdNumber && shortStudentProgram ? ' · ' : ''}
              {shortStudentProgram && <span data-student-program>{shortStudentProgram}</span>}
            </p>
          </section>
          <hr className="review-divider" style={{ margin: '4px 0' }} />
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-foreground)' }}>
            Contributing as <strong data-name>{contributorName}</strong>. Your identity is always visible with your review.
          </p>
        </>
      )}

      {serverError && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-status-danger-subtle, rgba(239, 68, 68, 0.12))',
            border: '1px solid var(--color-status-danger, #ef4444)',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--color-status-danger, #ef4444)',
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

      {/* Constrained Rich-Text Editor (In-Place Live Formatting matching mockup #review-editor) */}
      <div className="ui-form-group">
        <span className="ui-form-label" id="review-editor-label">
          Review text
        </span>
        <div id="editor-container">
          <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting toolbar">
            <button
              type="button"
              className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`.trim()}
              data-format="bold"
              title="Bold (Ctrl+B)"
              aria-label="Bold"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat('bold')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </button>
            <button
              type="button"
              className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`.trim()}
              data-format="italic"
              title="Italic (Ctrl+I)"
              aria-label="Italic"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat('italic')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <div className="toolbar-divider" />
            <button
              type="button"
              className={`toolbar-btn ${activeFormats.bullet ? 'active' : ''}`.trim()}
              data-format="bullet"
              title="Bulleted list"
              aria-label="Bulleted list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat('bullet')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="6" x2="20" y2="6" />
                <line x1="9" y1="12" x2="20" y2="12" />
                <line x1="9" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="4" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className={`toolbar-btn ${activeFormats.number ? 'active' : ''}`.trim()}
              data-format="number"
              title="Numbered list"
              aria-label="Numbered list"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat('number')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </button>
            <div className="toolbar-divider" />
            <button
              type="button"
              id="toolbar-attach-btn"
              className={`toolbar-btn ${attachedFiles.length > 0 ? 'active' : ''}`.trim()}
              title={
                attachedFiles.length > 0
                  ? `${attachedFiles.length} file${attachedFiles.length > 1 ? 's' : ''} attached (click to add more)`
                  : 'Attach files'
              }
              aria-label="Attach files"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              aria-label="Attach files to review"
              type="file"
              id="review-attachment-input"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []);
                if (selected.length > 0) {
                  setAttachedFiles((prev) => [
                    ...prev,
                    ...selected.map((f) => ({ name: f.name, size: f.size })),
                  ]);
                }
                e.target.value = '';
              }}
            />
            <div className="is-27fa88f" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted-foreground)' }}>
              Live formatting
            </div>
          </div>

          <div
            id="review-editor"
            ref={editorDivRef}
            className="review-rich-editor"
            aria-labelledby="review-editor-label"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-invalid={Boolean(bodyFieldError || isOverWordLimit)}
            data-invalid={Boolean(bodyFieldError || isOverWordLimit) || undefined}
            data-empty={!editorText.trim() ? 'true' : undefined}
            data-placeholder="Describe how you worked with this student and what you observed."
            onInput={() => {
              syncFromContentEditable();
              updateToolbarActiveState();
            }}
            onKeyUp={updateToolbarActiveState}
            onMouseUp={updateToolbarActiveState}
            onFocus={updateToolbarActiveState}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                applyFormat('bold');
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                applyFormat('italic');
              }
            }}
          />
          <textarea
            id="review-text"
            name="body"
            value={editorText}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          />
        </div>

        {/* Newly selected file attachments */}
        {attachedFiles.length > 0 && (
          <div
            id="attachment-container"
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
              <span id="attachment-status" className="muted" style={{ fontSize: '12px', fontWeight: 500 }}>
                {attachedFiles.length} {attachedFiles.length === 1 ? 'file' : 'files'} attached
              </span>
              <button
                type="button"
                id="attachment-clear-btn"
                title="Remove all attached files"
                onClick={() => setAttachedFiles([])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0 4px',
                  fontSize: '12px',
                  color: 'var(--color-status-danger, #ef4444)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Remove all
              </button>
            </div>
            <div id="attachment-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {attachedFiles.map((file, index) => (
                <Badge key={`${file.name}-${index}`} variant="neutral">
                  <span>📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index))}
                    style={{ marginLeft: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Attachment Metadata Display (Read-only existing contract attachments) */}
        {existingAttachments.length > 0 && (
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
                Attachments ({existingAttachments.length})
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {existingAttachments.map((att) => (
                <Badge key={att.id} variant="neutral">
                  📎 {att.mime_type} ({(att.size_bytes / 1024).toFixed(1)} KB)
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <small className="muted">Constructive feedback grounded in student coursework.</small>
          <small
            id="review-limit-counter"
            data-testid="review-word-counter"
            className={isOverWordLimit ? 'word-count-over' : 'muted'}
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: isOverWordLimit ? 'var(--color-status-danger, #ef4444)' : undefined,
              fontWeight: isOverWordLimit ? 700 : undefined,
            }}
          >
            <span>{wordCount} / {REVIEW_WORD_LIMIT} words</span>{' '}
            <span style={{ opacity: 0.75 }}>({charCount} chars)</span>
          </small>
        </div>

        {bodyFieldError && (
          <p role="alert" style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-status-danger, #ef4444)', fontWeight: 600 }}>
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
          id="tag-input-box"
          className="tag-input-box"
          onClick={() => tagInputRef.current?.focus()}
        >
          <div id="tag-chips-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {watchedTags.map((tag) => (
              <Badge key={tag} variant={getTagBadgeVariant(tag)}>
                <span>#{tag}</span>
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTagChip(tag);
                  }}
                  style={{ marginLeft: '6px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
          <input
            ref={tagInputRef}
            id="review-tag-input"
            className="tag-input-field"
            type="text"
            value={tagDraft}
            placeholder="Type comma-separated tags or choose from suggestions..."
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              blurTimeoutRef.current = setTimeout(() => {
                if (typeof window !== 'undefined') {
                  setShowSuggestions(false);
                }
              }, 150);
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
          />
        </div>

        {showSuggestions && (filteredSuggestions.length > 0 || canQuickAddDraftTag) && (
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
                onMouseDown={(e) => e.preventDefault()}
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
            {canQuickAddDraftTag && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
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
                + Add tag &quot;{normalizedDraftTag}&quot;
              </button>
            )}
          </div>
        )}

        <small className="muted is-d9dc7ea" style={{ marginTop: '2px' }}>
          Tags are comma-separated. Select from suggestions or type tags separated by commas and press Enter.
        </small>

        {tagsFieldError && (
          <p role="alert" style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-status-danger, #ef4444)', fontWeight: 600 }}>
            {tagsFieldError}
          </p>
        )}
      </div>

      <p id="review-footer-note" className="muted" style={{ margin: 0, fontSize: '12px' }}>
        {mode === 'edit'
          ? 'A review update is active immediately. You can view previous versions in edit history from the student page.'
          : 'A new review is active immediately. You can edit, hide, or delete your own review from the student page.'}
      </p>

      <div className="actions review-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button type="button" id="cancel-review-btn" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" id="submit-review-btn" variant="primary" disabled={isPending}>
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
  );

  if (asPage) {
    if (!isOpen) return null;
    return formElement;
  }

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
      {formElement}
    </Modal>
  );
}
