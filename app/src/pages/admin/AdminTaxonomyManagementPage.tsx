import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import { AdminEntityModal, RemoveConfirmationModal, Alert, Badge, Button, DataTable, Input } from '../../components/ui';
import { useQueueSearchParam } from '../../components/queue-modal';
import { useSession } from '../../context/SessionContext';
import {
  useDepartments, usePrograms, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  useCreateProgram, useUpdateProgram, useDeleteProgram, useApprovalQueueItems,
  type Department,
} from '../../hooks';
import { ApiRequestError } from '../../lib/api';
import { taxonomyProposalSchema, createTaxonomyProposalEditSchema, type TaxonomyProposalFormValues } from '../../lib/validation/taxonomyProposal';
import './AdminTaxonomyManagementPage.css';

type Mode = 'departments' | 'programs';
type Selection = { action: 'create' } | { action: 'edit' | 'remove'; record: Department };

function ErrorNotice({ error }: { error: Error }) {
  return <Alert variant="warning" title={error.message}
    description={error instanceof ApiRequestError ? error.hint ?? '' : ''} />;
}

function TaxonomyDialog({ mode, selection, onClose, onSaved }: {
  mode: Mode; selection: Selection; onClose: () => void; onSaved: (message: string) => void;
}) {
  const label = mode === 'departments' ? 'Department' : 'Program';
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();
  const create = mode === 'departments' ? createDepartment : createProgram;
  const update = mode === 'departments' ? updateDepartment : updateProgram;
  const remove = mode === 'departments' ? deleteDepartment : deleteProgram;
  const [requestError, setRequestError] = useState<Error | null>(null);
  const form = useForm<TaxonomyProposalFormValues>({
    resolver: zodResolver(selection.action === 'edit'
      ? createTaxonomyProposalEditSchema(selection.record.name) : taxonomyProposalSchema),
    defaultValues: {
      type: mode === 'departments' ? 'department_proposal' : 'program_proposal',
      payload: { name: selection.action === 'create' ? '' : selection.record.name },
    },
  });
  const pending = form.formState.isSubmitting || create.isPending || update.isPending || remove.isPending;
  const close = () => { if (!pending) onClose(); };
  const saved = (action: string) => { onSaved(`${label} ${action} Successfully`); onClose(); };
  const submit = form.handleSubmit(async (values) => {
    setRequestError(null);
    try {
      if (selection.action === 'edit') {
        await update.mutateAsync({ id: selection.record.id, name: values.payload.name });
        saved('Updated');
      } else {
        await create.mutateAsync({ name: values.payload.name });
        saved('Created');
      }
    } catch (error) { setRequestError(error instanceof Error ? error : new Error('Unable to save record.')); }
  });
  if (selection.action === 'remove') {
    return <RemoveConfirmationModal open onClose={close} entityLabel={label} pending={pending}
      closeOnConfirm={false} error={requestError && <ErrorNotice error={requestError} />}
      onConfirm={async () => {
        if (pending) return;
        setRequestError(null);
        try { await remove.mutateAsync(selection.record.id); saved('Removed'); }
        catch (error) { setRequestError(error instanceof Error ? error : new Error('Unable to remove record.')); }
      }} />;
  }
  const editing = selection.action === 'edit';
  return <AdminEntityModal open onClose={close} title={`${editing ? 'Edit' : 'Add'} ${label}`}
    subtitle={`Enter the official ${mode === 'departments' ? 'department' : 'degree program'} title below.`}
    onSubmit={submit}>
    <Alert variant="info" title={editing ? 'Confirm Update' : 'Confirm Addition'}
      description={`You are about to ${editing ? 'update' : 'add'} this ${label.toLowerCase()} record. Review the details below before ${editing ? 'saving your changes' : 'proceeding'}.`} />
    <Input label={`${label} Name`} id="entityName" aria-required="true" disabled={pending}
      placeholder={`e.g. ${mode === 'departments' ? 'Department of Computer Science' : 'Bachelor of Science in Computer Science'}`}
      {...form.register('payload.name')} error={form.formState.errors.payload?.name?.message} />
    {requestError && <ErrorNotice error={requestError} />}
    <div className="modal-actions">
      <Button variant="outline" className="modal-btn-cancel" onClick={close} disabled={pending}>Cancel</Button>
      <Button type="submit" className="modal-submit" disabled={pending}>{editing ? 'Update' : `Add ${label}`}</Button>
    </div>
  </AdminEntityModal>;
}

function TaxonomyManagement({ mode }: { mode: Mode }) {
  const label = mode === 'departments' ? 'Department' : 'Program';
  const title = mode === 'departments' ? 'Departments' : 'Programs';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [toast, setToast] = useState('');
  const { openQueue } = useQueueSearchParam();
  const departments = useDepartments(undefined, { enabled: mode === 'departments' });
  const programs = usePrograms(undefined, { enabled: mode === 'programs' });
  const list = mode === 'departments' ? departments : programs;
  const queue = useApprovalQueueItems({ type: `eq.${mode === 'departments' ? 'department_proposal' : 'program_proposal'}`, status: 'eq.pending' });
  const records = (list.data ?? []).filter(record => record.name.toLowerCase().includes(search.trim().toLowerCase()) && (status === 'all' || record.status === status));
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return <AppShell role="admin" activeNavKey={mode} breadcrumb={`Admin Portal / ${title}`}>
    <div className="admin-taxonomy-management">
      <div className="header-container">
        <div className="heading-wrapper"><h1 className="heading-title">{title}</h1></div>
        <Button variant="add" onClick={() => setSelection({ action: 'create' })}>Add {label}</Button>
      </div>
      <div className="controls-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <Input className="search-input" type="search" aria-label={`Search by ${label.toLowerCase()} name`}
            placeholder={`Search by ${label.toLowerCase()} name...`} value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="controls-actions">
          <Button variant="outline" className="queue-button" aria-label={`Open ${label.toLowerCase()} applications queue`}
            onClick={() => openQueue(mode === 'departments' ? 'department' : 'program')}>
            Queue <span className="queue-counter">{queue.isError ? '—' : queue.data?.length ?? '…'}</span>
          </Button>
          <div className="dropdown-container status">
            <select className="dropdown-select" aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)}>
              <option value="all">Status: All</option><option value="approved">Approved</option>
            </select>
            <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
      {list.isError ? <><ErrorNotice error={list.error} /><Button variant="outline" onClick={() => void list.refetch()}>Retry</Button></> :
        <DataTable key={`${mode}:${search}:${status}`} layoutMode="flex" data={records} getRowId={record => record.id}
          ariaLabel={title} isLoading={list.isPending} emptyTitle={search || status !== 'all' ? `No matching ${mode}` : `No ${mode} yet`}
          emptyDescription={search || status !== 'all' ? 'Try adjusting your search or filters.' : `${label} records will appear here when they are added.`}
          columns={[
            { key: 'name', label, colClass: 'col-taxonomy' },
            { key: 'status', label: 'Status', colClass: 'col-status text-center', headerClass: 'col-status text-center ui-table-heading-center', render: record =>
              <Badge variant={record.status === 'approved' ? 'success' : 'warning'}>
                {record.status === 'approved' && <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>}
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </Badge> },
            { key: 'actions', label: 'Actions', colClass: 'col-action text-right', headerClass: 'col-action text-center ui-table-heading-center', render: record =>
              <div className="action-group">
                <button className="pill-btn edit-btn" type="button" onClick={() => setSelection({ action: 'edit', record })}>Edit</button>
                <button className="pill-btn remove-btn" type="button" onClick={() => setSelection({ action: 'remove', record })}>Remove</button>
              </div> },
          ]} />}
      {selection && <TaxonomyDialog mode={mode} selection={selection} onClose={() => setSelection(null)} onSaved={setToast} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  </AppShell>;
}

export function AdminTaxonomyManagementPage({ mode }: { mode: Mode }) {
  const { role, loading } = useSession();
  if (loading) return null;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <TaxonomyManagement key={mode} mode={mode} />;
}

