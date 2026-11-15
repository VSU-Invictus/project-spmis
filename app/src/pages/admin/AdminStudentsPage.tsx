import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { AppShell } from '../../components/navigation/AppShell';
import { AdminEntityModal, RemoveConfirmationModal, Alert, Button, DataTable, Input } from '../../components/ui';
import { useQueueSearchParam } from '../../components/queue-modal';
import { useSession } from '../../context/SessionContext';
import {
  useStudentSearchPage, useStudentById, useCreateStudentDirect, useUpdateStudent,
  useApprovedProgramOptions, useApprovalQueueItems, type StudentProfile, type Program,
} from '../../hooks';
import { studentSchema } from '../../lib/validation/student';
import { ApiRequestError } from '../../lib/api';
import './AdminStudentsPage.css';

type Selection = { action: 'create' } | { action: 'edit' | 'remove'; id: string };
const DELETION_UNAVAILABLE = 'Student deletion is not yet available because the current API contract does not include this operation. No student record will be removed.';

function RequestError({ error, retry }: { error: Error; retry?: () => void }) {
  return <>
    <Alert variant="warning" title={error.message} description={error instanceof ApiRequestError ? error.hint ?? '' : ''} />
    {retry && <Button variant="outline" onClick={retry}>Retry</Button>}
  </>;
}

function Chevron({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

function StudentForm({ student, programs, onClose, onSaved }: {
  student?: StudentProfile; programs: Program[]; onClose: () => void; onSaved: (message: string) => void;
}) {
  const create = useCreateStudentDirect();
  const update = useUpdateStudent();
  const submitting = useRef(false);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const initial = {
    student_id_number: student?.student_id_number ?? '',
    first_name: student?.first_name ?? '',
    last_name: student?.last_name ?? '',
    middle_name: student?.middle_name ?? '',
    program_id: student?.program_id ?? '',
  };
  const form = useForm<z.input<typeof studentSchema>, unknown, z.output<typeof studentSchema>>({
    resolver: zodResolver(studentSchema), defaultValues: initial,
  });
  const pending = form.formState.isSubmitting || create.isPending || update.isPending;
  const close = () => { if (!submitting.current) onClose(); };
  const submit = form.handleSubmit(async values => {
    if (submitting.current) return;
    setRequestError(null);
    if (!programs.some(program => program.id === values.program_id)) {
      form.setError('program_id', { message: 'Select an approved program.' });
      return;
    }
    if (student && Object.entries(values).every(([key, value]) => {
      const original = initial[key as keyof typeof initial].trim();
      return (value ?? '') === original;
    })) {
      form.setError('root', { message: 'Please enter a new, distinct value before updating.' });
      return;
    }
    submitting.current = true;
    try {
      if (student) await update.mutateAsync({ id: student.id, ...values });
      else await create.mutateAsync(values);
      onSaved(`Student ${student ? 'Updated' : 'Created'} Successfully`);
      onClose();
    } catch (error) {
      setRequestError(error instanceof Error ? error : new Error('Unable to save student.'));
    } finally { submitting.current = false; }
  });
  const errors = form.formState.errors;
  return <AdminEntityModal open onClose={close} title={student ? 'Edit Student' : 'Create Student'}
    subtitle="Enter student identity and program enrollment details." cardClassName="student" onSubmit={submit}>
    <Alert variant="info" title={student ? 'Confirm Update' : 'Confirm Addition'}
      description={student
        ? 'You are about to update this student record. Review the details below before saving your changes.'
        : 'You are about to add this student record. Review the details below before proceeding.'} />
    <Input id="studentId" label="Student ID" aria-required="true" placeholder="e.g. 27-6-76767"
      disabled={pending} {...form.register('student_id_number')} error={errors.student_id_number?.message} />
    <div className="admin-student-name-fields">
      <Input id="studentFname" label="First Name" aria-required="true" placeholder="e.g. John"
        disabled={pending} {...form.register('first_name')} error={errors.first_name?.message} />
      <Input id="studentLname" label="Last Name" aria-required="true" placeholder="e.g. Doe"
        disabled={pending} {...form.register('last_name')} error={errors.last_name?.message} />
    </div>
    <Input id="studentMname" label="Middle Name" placeholder="Optional" disabled={pending}
      {...form.register('middle_name')} error={errors.middle_name?.message} />
    <div className="ui-form-group">
      <label htmlFor="studentProgram" className="ui-form-label">Program</label>
      <div className="modal-select-wrapper">
        <select id="studentProgram" className="ui-input" aria-required="true" disabled={pending}
          aria-invalid={Boolean(errors.program_id) || undefined}
          aria-describedby={errors.program_id ? 'studentProgram-error' : undefined} {...form.register('program_id')}>
          <option value="" disabled>Select Program</option>
          {student && !programs.some(program => program.id === student.program_id) &&
            <option value={student.program_id} disabled>Current program unavailable — select an approved program</option>}
          {programs.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}
        </select>
        <Chevron className="modal-select-chevron" />
      </div>
      {errors.program_id && <span id="studentProgram-error" className="ui-field-error" role="alert" style={{ color: 'var(--color-status-danger, #EF4444)', fontSize: 'var(--font-size-xs, 11px)' }}>Select an approved program.</span>}
    </div>
    {programs.length === 0 && <Alert variant="warning" title="No approved programs available" description="A student must belong to an approved program. Add or approve a program before saving." />}
    {errors.root && <Alert variant="warning" title="No changes to save" description={errors.root.message ?? ''} />}
    {requestError && <RequestError error={requestError} />}
    <div className="modal-actions">
      <Button variant="outline" className="modal-btn-cancel" disabled={pending} onClick={close}>Cancel</Button>
      <Button type="submit" className="modal-submit" disabled={pending || programs.length === 0}>Save Student</Button>
    </div>
  </AdminEntityModal>;
}

function StudentEditor({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: (message: string) => void }) {
  const detail = useStudentById(id);
  const programs = useApprovedProgramOptions();
  const loading = programs.isPending || Boolean(id && detail.isPending);
  const error = programs.error ?? (id ? detail.error : null);
  if (loading || error || (id && !detail.data)) {
    return <AdminEntityModal open onClose={onClose} title={id ? 'Edit Student' : 'Create Student'}
      subtitle="Enter student identity and program enrollment details." cardClassName="student" onSubmit={event => event.preventDefault()}>
      {loading ? <p role="status">Loading student form…</p> : error ?
        <RequestError error={error} retry={() => { void programs.refetch(); if (id) void detail.refetch(); }} /> :
        <Alert variant="warning" title="Student not found" description="This student record is no longer available. Close this dialog and refresh the roster." />}
      <div className="modal-actions"><Button variant="outline" className="modal-btn-cancel" onClick={onClose}>Cancel</Button></div>
    </AdminEntityModal>;
  }
  return <StudentForm student={id ? detail.data ?? undefined : undefined} programs={programs.data ?? []} onClose={onClose} onSaved={onSaved} />;
}

function StudentManagement() {
  const [search, setSearch] = useState('');
  const [programId, setProgramId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [toast, setToast] = useState('');
  const { openQueue } = useQueueSearchParam();
  const programs = useApprovedProgramOptions();
  const students = useStudentSearchPage({ query: search.trim() || undefined, program_id: programId || undefined,
    limit: pageSize, offset: (page - 1) * pageSize, order: 'created_at.desc,id.asc' });
  const queue = useApprovalQueueItems({ type: 'eq.student_registration', status: 'eq.pending' });
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!students.data) return;
    const total = students.data.total;
    const allowedSize = total < 10 ? 5 : total < 20 ? Math.min(pageSize, 10) : pageSize;
    if (allowedSize !== pageSize) { setPageSize(allowedSize); setPage(1); }
    else if (page > Math.max(1, Math.ceil(total / pageSize))) setPage(Math.max(1, Math.ceil(total / pageSize)));
  }, [students.data, page, pageSize]);
  return <AppShell role="admin" activeNavKey="students" breadcrumb="Admin Portal / Student Roster">
    <div className="admin-student-management">
      <div className="header-container">
        <div className="heading-wrapper"><h2 className="heading-title">Student Roster</h2></div>
        <Button variant="add" onClick={() => setSelection({ action: 'create' })}>Add Student</Button>
      </div>
      <div className="controls-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" /></svg>
          <Input className="search-input" aria-label="Search by student id or name" placeholder="Search by student id or name..."
            value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div className="controls-actions">
          <Button variant="outline" className="queue-button" aria-label="Open student applications queue" onClick={() => openQueue('student')}>
            Queue <span className="queue-counter">{queue.isError ? '—' : queue.data?.length ?? '…'}</span>
          </Button>
          <div className="dropdown-container program">
            <select className="dropdown-select" aria-label="Filter by program" value={programId} disabled={programs.isPending || programs.isError}
              onChange={event => { setProgramId(event.target.value); setPage(1); }}>
              <option value="">Program: All</option>
              {programs.data?.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            <Chevron className="dropdown-chevron" />
          </div>
        </div>
      </div>
      {programs.isError && <RequestError error={programs.error} retry={() => void programs.refetch()} />}
      {students.isError ? <RequestError error={students.error} retry={() => { if (page > 1) setPage(1); else void students.refetch(); }} /> :
        <DataTable layoutMode="flex" ariaLabel="Student roster" data={students.data?.students ?? []} getRowId={row => row.id}
          isLoading={students.isFetching} emptyTitle={search || programId ? 'No matching students' : 'No students yet'}
          emptyDescription={search || programId ? 'Try adjusting your search or filters.' : 'Student records will appear here when they are added.'}
          pagination={{ page, pageSize, totalEntries: students.data?.total ?? 0, onPageChange: setPage,
            onPageSizeChange: size => { setPageSize(size); setPage(1); } }}
          columns={[
            { key: 'student_id_number', label: 'Student ID', colClass: 'col-id' },
            { key: 'first_name', label: 'First Name', colClass: 'col-fname' },
            { key: 'middle_name', label: 'Middle Name', colClass: 'col-mname', render: row => row.middle_name || '—' },
            { key: 'last_name', label: 'Last Name', colClass: 'col-lname' },
            { key: 'program_name', label: 'Program', colClass: 'col-program' },
            { key: 'actions', label: 'Actions', colClass: 'col-action', headerClass: 'col-action text-center ui-table-heading-center', render: row => <>
              <button type="button" className="pill-btn-sm edit" onClick={() => setSelection({ action: 'edit', id: row.id })}>Edit</button>
              <button type="button" className="pill-btn-sm remove" title="Student deletion is not yet available" onClick={() => setSelection({ action: 'remove', id: row.id })}>Remove</button>
            </> },
          ]} />}
      {selection?.action === 'remove' && <RemoveConfirmationModal open onClose={() => setSelection(null)} entityLabel="Student" unavailableReason={DELETION_UNAVAILABLE} />}
      {selection && selection.action !== 'remove' && <StudentEditor id={selection.action === 'edit' ? selection.id : undefined}
        onClose={() => setSelection(null)} onSaved={message => { setToast(message); setPage(1); }} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  </AppShell>;
}

export function AdminStudentsPage() {
  const { role, loading } = useSession();
  if (loading) return null;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <StudentManagement />;
}
