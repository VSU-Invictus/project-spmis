import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '../../components/navigation/AppShell';
import { AdminEntityModal, RemoveConfirmationModal, Alert, Badge, Button, DataTable, Input } from '../../components/ui';
import { useQueueSearchParam } from '../../components/queue-modal';
import { useSession } from '../../context/SessionContext';
import { useAdminQueueBrowse } from '../../hooks/useAdminQueueBrowse';
import {
  useFacultyList, useCreateFacultyByAdmin, useUpdateFacultyByAdmin, useDeleteFaculty,
  useApprovedDepartmentOptions, useDepartmentOptions,
  type FacultyListItem, type UpdateFacultyByAdminInput, type Department,
} from '../../hooks';
import { facultyEditSchema, type FacultyEditValues } from '../../lib/validation/faculty';
import { ApiRequestError } from '../../lib/api';
import { confirmsMutation } from '../../lib/api/confirmMutation';
import './AdminFacultyPage.css';

type Selection = { action: 'create' } | { action: 'edit' | 'remove'; id: string };
const SELF_DELETION_UNAVAILABLE = 'You cannot remove your own active administrator account.';

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

function FacultyForm({ faculty, departments, onClose, onSaved }: {
  faculty?: FacultyListItem; departments: Department[]; onClose: () => void; onSaved: (message: string) => void;
}) {
  const { profile, syncProfile } = useSession();
  const create = useCreateFacultyByAdmin();
  const update = useUpdateFacultyByAdmin();
  const submitting = useRef(false);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const initial: FacultyEditValues = {
    full_name: faculty?.full_name ?? '', email: faculty?.email ?? '',
    department_id: faculty?.department_id ?? '', role: faculty?.role ?? 'faculty',
  };
  const form = useForm<FacultyEditValues>({ resolver: zodResolver(facultyEditSchema), defaultValues: initial });
  const selectableDepartments = faculty ? departments : departments.filter(department => department.status === 'approved');
  const pending = form.formState.isSubmitting || create.isPending || update.isPending;
  const close = () => { if (!submitting.current) onClose(); };
  const submit = form.handleSubmit(async values => {
    if (submitting.current) return;
    setRequestError(null);
    if (!faculty) {
      if (!selectableDepartments.some(department => department.id === values.department_id && department.status === 'approved')) {
        form.setError('department_id', { message: 'Select an approved department.' });
        return;
      }
      const payload = {
        full_name: values.full_name,
        email: values.email.toLowerCase(),
        department_id: values.department_id,
        role: values.role,
        status: 'active' as const,
      };
      submitting.current = true;
      try {
        const result = await create.mutateAsync(payload);
        if (!confirmsMutation(result, payload)) {
          throw new Error('The server did not confirm the requested faculty creation. Close this dialog and refresh the roster before trying again.');
        }
        onSaved('Faculty Created Successfully');
        onClose();
      } catch (error) {
        setRequestError(error instanceof Error ? error : new Error('Unable to create faculty.'));
      } finally { submitting.current = false; }
      return;
    }
    // Send only changed, approved form fields; never overwrite account status.
    const changes: Omit<UpdateFacultyByAdminInput, 'id'> = {};
    if (values.full_name !== initial.full_name.trim()) changes.full_name = values.full_name;
    if (values.email !== initial.email.trim()) changes.email = values.email;
    if (values.department_id !== initial.department_id) changes.department_id = values.department_id;
    if (values.role !== initial.role) changes.role = values.role;
    if (!Object.keys(changes).length) {
      form.setError('root', { message: 'Please enter a new, distinct value before updating.' });
      return;
    }
    if (changes.department_id && !departments.some(department => department.id === changes.department_id)) {
      form.setError('department_id', { message: 'Select a department from the available list.' });
      return;
    }
    submitting.current = true;
    try {
      const result = await update.mutateAsync({ id: faculty.id, ...changes });
      const saved = result.find(item => item.id === faculty.id);
      if (!saved) throw new Error('No faculty record was updated. Close the dialog and refresh the roster.');
      // SessionContext is separate from the query cache; self-edits must update route access too.
      if (profile?.id === saved.id) syncProfile(saved);
      onSaved('Faculty Updated Successfully');
      onClose();
    } catch (error) {
      setRequestError(error instanceof Error ? error : new Error('Unable to update faculty.'));
    } finally { submitting.current = false; }
  });
  const errors = form.formState.errors;
  return <AdminEntityModal open onClose={close} title={faculty ? 'Edit Faculty' : 'Add Faculty'}
    subtitle="Enter faculty credentials and assignment details." cardClassName="faculty" noValidate
    onSubmit={submit}>
    <Alert variant="info" title={faculty ? 'Confirm Update' : 'Confirm Addition'}
      description={faculty
        ? 'You are about to update this faculty record. Review the details below before saving your changes.'
        : 'You are about to add this faculty record. Review the details below before proceeding.'} />
    <Input id="facultyName" label="Full Name" aria-required="true" placeholder="e.g. Dr. Jane Doe"
      disabled={pending} {...form.register('full_name')} error={errors.full_name?.message} />
    <Input id="facultyEmail" label="Email Address" type="email" aria-required="true" placeholder="e.g. jdoe@university.edu"
      disabled={pending} {...form.register('email')} error={errors.email?.message} />
    <div className="ui-form-group">
      <label htmlFor="facultyDepartment" className="ui-form-label">Department</label>
      <div className="modal-select-wrapper">
        <select id="facultyDepartment" className="ui-input" aria-required="true" disabled={pending}
          aria-invalid={Boolean(errors.department_id) || undefined}
          aria-describedby={errors.department_id ? 'facultyDepartment-error' : undefined} {...form.register('department_id')}>
          <option value="" disabled>Select Department</option>
          {faculty && !selectableDepartments.some(department => department.id === faculty.department_id) &&
            <option value={faculty.department_id}>Current department unavailable</option>}
          {selectableDepartments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
        </select>
        <Chevron className="modal-select-chevron" />
      </div>
      {errors.department_id && <span id="facultyDepartment-error" className="ui-field-error" role="alert"
        style={{ color: 'var(--color-status-danger, #EF4444)', fontSize: 'var(--font-size-xs, 11px)' }}>{errors.department_id.message}</span>}
    </div>
    <div className="ui-form-group">
      <label htmlFor="facultyRole" className="ui-form-label">Role</label>
      <div className="modal-select-wrapper">
        <select id="facultyRole" className="ui-input" aria-required="true" disabled={pending} {...form.register('role')}>
          <option value="faculty">Faculty</option><option value="admin">Admin</option>
        </select>
        <Chevron className="modal-select-chevron" />
      </div>
      {errors.role && <Alert variant="warning" title="Invalid role" description="Select Faculty or Admin." />}
    </div>
    {!faculty && selectableDepartments.length === 0 && <Alert variant="warning" title="No approved departments available"
      description="A faculty member must belong to an approved department. Add or approve a department before saving." />}
    {errors.root && <Alert variant="warning" title="No changes to save" description={errors.root.message ?? ''} />}
    {requestError && <RequestError error={requestError} />}
    <div className="modal-actions">
      <Button variant="outline" className="modal-btn-cancel" disabled={pending} onClick={close}>Cancel</Button>
      <Button type="submit" className="modal-submit" disabled={pending || (!faculty && selectableDepartments.length === 0)}>{faculty ? 'Update' : 'Add Faculty'}</Button>
    </div>
  </AdminEntityModal>;
}

function FacultyEditor({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: (message: string) => void }) {
  const detail = useFacultyList(id ? { id: `eq.${id}` } : undefined, { enabled: Boolean(id) });
  const approvedDepartments = useApprovedDepartmentOptions({ enabled: !id });
  const allDepartments = useDepartmentOptions({ enabled: Boolean(id) });
  const departments = id ? allDepartments : approvedDepartments;
  const loading = departments.isPending || Boolean(id && detail.isPending);
  const error = departments.error ?? (id ? detail.error : null);
  const faculty = id ? detail.data?.find(item => item.id === id) : undefined;
  if (loading || error || (id && !faculty)) {
    return <AdminEntityModal open onClose={onClose} title={id ? 'Edit Faculty' : 'Add Faculty'}
      subtitle="Enter faculty credentials and assignment details." cardClassName="faculty" onSubmit={event => event.preventDefault()}>
      {loading ? <p role="status">Loading faculty form…</p> : error ?
        <RequestError error={error} retry={() => { void departments.refetch(); if (id) void detail.refetch(); }} /> :
        <Alert variant="warning" title="Faculty not found" description="This faculty record is no longer available. Close this dialog and refresh the roster." />}
      <div className="modal-actions"><Button variant="outline" className="modal-btn-cancel" onClick={onClose}>Cancel</Button></div>
    </AdminEntityModal>;
  }
  return <FacultyForm faculty={faculty} departments={departments.data ?? []} onClose={onClose} onSaved={onSaved} />;
}

function FacultyRemoveDialog({ id, isSelf, onClose, onSaved }: {
  id: string; isSelf: boolean; onClose: () => void; onSaved: (message: string) => void;
}) {
  const remove = useDeleteFaculty();
  const submitting = useRef(false);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const close = () => { if (!submitting.current) onClose(); };
  const confirm = async () => {
    if (isSelf || submitting.current) return;
    setRequestError(null);
    submitting.current = true;
    try {
      await remove.mutateAsync(id);
      onSaved('Faculty Removed Successfully');
      onClose();
    } catch (error) {
      setRequestError(error instanceof Error ? error : new Error('Unable to remove faculty.'));
    } finally { submitting.current = false; }
  };
  return <RemoveConfirmationModal open onClose={close} entityLabel="Faculty"
    unavailableReason={isSelf ? SELF_DELETION_UNAVAILABLE : undefined}
    closeOnConfirm={false} pending={remove.isPending}
    error={requestError && <RequestError error={requestError} />} onConfirm={() => void confirm()} />;
}

function FacultyManagement({ profileId }: { profileId: string }) {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [toast, setToast] = useState('');
  const { openQueue } = useQueueSearchParam();
  const departments = useDepartmentOptions();
  // Escape LIKE first, then quote the PostgREST operand. These are separate parser layers;
  // JSON.stringify must also escape the pattern's backslashes and embedded quotes.
  const pattern = JSON.stringify(`%${search.trim().replace(/[\\%_*]/g, '\\$&')}%`);
  const faculty = useFacultyList({ or: search.trim() ? `(full_name.ilike.${pattern},email.ilike.${pattern})` : undefined,
    department_id: departmentId ? `eq.${departmentId}` : undefined, order: 'created_at.desc,id.asc' });
  const queue = useAdminQueueBrowse('faculty_account', profileId);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return <AppShell role="admin" activeNavKey="faculty" breadcrumb="Admin Portal / Faculty Roster">
    <div className="admin-faculty-management">
      <div className="header-container">
        <div className="heading-wrapper"><h1 className="heading-title">Faculty</h1></div>
        <Button variant="add" onClick={() => setSelection({ action: 'create' })}>Add Faculty</Button>
      </div>
      <div className="controls-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <Input className="search-input" type="search" aria-label="Search by faculty name or email" placeholder="Search by faculty name or email..."
            value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="controls-actions">
          <Button variant="outline" className="queue-button" aria-label="Open faculty applications queue" onClick={() => openQueue('faculty')}>
            Queue <span className="queue-counter">{queue.isError ? '—' : queue.data?.length ?? '…'}</span>
          </Button>
          <div className="dropdown-container department">
            <select className="dropdown-select" aria-label="Filter by department" value={departmentId} disabled={departments.isPending || departments.isError}
              onChange={event => setDepartmentId(event.target.value)}>
              <option value="">Department: All</option>
              {departments.data?.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <Chevron className="dropdown-chevron" />
          </div>
        </div>
      </div>
      {departments.isError && <RequestError error={departments.error} retry={() => void departments.refetch()} />}
      {faculty.isError ? <RequestError error={faculty.error} retry={() => void faculty.refetch()} /> :
        <DataTable layoutMode="flex" ariaLabel="Faculty roster" data={faculty.data ?? []} getRowId={row => row.id}
          isLoading={faculty.isFetching} emptyTitle={search || departmentId ? 'No matching faculty' : 'No faculty yet'}
          emptyDescription={search || departmentId ? 'Try adjusting your search or filters.' : 'Faculty records will appear here when they are added.'}
          columns={[
            { key: 'full_name', label: 'Name', colClass: 'col-name' },
            { key: 'email', label: 'Email Address', colClass: 'col-email' },
            { key: 'department_id', label: 'Department', colClass: 'col-dept', render: row =>
              departments.data?.find(department => department.id === row.department_id)?.name ?? (departments.isPending ? '…' : 'Unavailable') },
            { key: 'role', label: 'Role', colClass: 'col-role text-center', render: row =>
              <Badge variant={row.role === 'admin' ? 'destructive' : 'info'}>{row.role === 'admin' ? 'Admin' : 'Faculty'}</Badge> },
            { key: 'actions', label: 'Actions', colClass: 'col-action text-right', headerClass: 'col-action text-center ui-table-heading-center', render: row =>
              <div className="action-group">
                <button type="button" className="pill-btn edit-btn" onClick={() => setSelection({ action: 'edit', id: row.id })}>Edit</button>
                <button type="button" className="pill-btn remove-btn" title={row.id === profileId ? SELF_DELETION_UNAVAILABLE : undefined} onClick={() => setSelection({ action: 'remove', id: row.id })}>Remove</button>
              </div> },
          ]} />}
      {selection?.action === 'remove' && <FacultyRemoveDialog id={selection.id} isSelf={selection.id === profileId}
        onClose={() => setSelection(null)} onSaved={setToast} />}
      {selection && selection.action !== 'remove' && <FacultyEditor id={selection.action === 'edit' ? selection.id : undefined}
        onClose={() => setSelection(null)} onSaved={setToast} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  </AppShell>;
}

export function AdminFacultyPage() {
  const { role, loading, profile } = useSession();
  if (loading) return null;
  if (role !== 'admin' || !profile) return <Navigate to="/" replace />;
  return <FacultyManagement key={profile.id} profileId={profile.id} />;
}
