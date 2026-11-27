import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppShell } from '../../components/navigation/AppShell';
import { Alert, Badge, Button, DataTable, FacultyProposalDialog, Input, Toast } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useDepartmentOptions } from '../../hooks/useDepartments';
import { useApprovedProgramOptions } from '../../hooks/usePrograms';
import { useSubmitApplication } from '../../hooks/useSubmitApplication';
import { ApiRequestError } from '../../lib/api';
import { taxonomyProposalSchema, createTaxonomyProposalEditSchema, type TaxonomyProposalFormValues } from '../../lib/validation/taxonomyProposal';
import './FacultyTaxonomyPage.css';

type Mode = 'departments' | 'programs';
type EditTarget = { id: string; name: string };

function ProposalForm({ mode, record, onClose, onSubmitted }: {
  mode: Mode; record?: EditTarget; onClose: () => void; onSubmitted: () => void;
}) {
  const { role, status, loading } = useSession();
  const label = mode === 'departments' ? 'department' : 'program';
  // The frozen contract explicitly leaves department edit scope under team review.
  const unavailable = mode === 'departments' && Boolean(record);
  const submission = useSubmitApplication();
  const submitting = useRef(false);
  const [error, setError] = useState<Error | null>(null);
  const form = useForm<TaxonomyProposalFormValues>({
    resolver: zodResolver(record ? createTaxonomyProposalEditSchema(record.name) : taxonomyProposalSchema),
    defaultValues: mode === 'programs'
      ? { type: 'program_proposal', payload: { name: record?.name ?? '', ...(record ? { program_id: record.id } : {}) } }
      : { type: 'department_proposal', payload: { name: record?.name ?? '' } },
  });
  const pending = form.formState.isSubmitting || submission.isPending;
  const close = () => { if (!submitting.current) onClose(); };
  const submit = form.handleSubmit(async values => {
    if (unavailable || submitting.current || loading || role !== 'faculty' || status !== 'active') return;
    submitting.current = true;
    setError(null);
    try {
      const applications = await submission.mutateAsync(values);
      if (!applications.some(application => application.type === values.type && application.status === 'pending')) {
        throw new Error('The server did not return a pending proposal. Check your applications before trying again.');
      }
      onSubmitted();
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Unable to submit the proposal.'));
    } finally { submitting.current = false; }
  });
  return <FacultyProposalDialog open id="faculty-taxonomy-proposal" className="faculty-taxonomy-proposal" onClose={close}
    title={record ? `Apply to edit ${label}` : `Propose a ${label}`}>
    <form className="modal-form" noValidate onSubmit={submit} aria-busy={pending}>
      <Input id="entity-name" label="Proposed name" aria-required="true" autoFocus autoComplete="off"
        placeholder={`e.g. ${mode === 'departments' ? 'Department of Computer Science' : 'BS Data Science'}`}
        disabled={pending || unavailable} {...form.register('payload.name')} error={form.formState.errors.payload?.name?.message} />
      {unavailable && <p className="ui-form-error" role="status">Department edit proposals are currently unavailable because their scope in the API contract is unresolved. No changes will be submitted.</p>}
      {error && <p className="ui-form-error" role="alert">{error.message} {error instanceof ApiRequestError && error.hint}</p>}
      <div className="modal-actions">
        <Button variant="outline" disabled={pending} onClick={close}>Cancel</Button>
        <Button type="submit" disabled={pending || unavailable}>Submit application</Button>
      </div>
    </form>
  </FacultyProposalDialog>;
}

function TaxonomyProposals({ mode }: { mode: Mode }) {
  const label = mode === 'departments' ? 'Department' : 'Program';
  const title = mode === 'departments' ? 'Departments' : 'Programs';
  const departments = useDepartmentOptions();
  const programs = useApprovedProgramOptions();
  const list = mode === 'departments' ? departments : programs;
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<{ record?: EditTarget } | null>(null);
  const [toast, setToast] = useState('');
  const trigger = useRef<HTMLElement | null>(null);
  const records = (list.data ?? []).filter(record => record.status === 'approved' && record.name.toLowerCase().includes(search.trim().toLowerCase()));
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const open = (element: HTMLElement, record?: EditTarget) => { trigger.current = element; setSelection({ record }); };
  const close = () => { setSelection(null); trigger.current?.focus(); };
  return <AppShell role="faculty" activeNavKey={mode} breadcrumb={`Faculty Portal / ${title}`}>
    <div className="faculty-taxonomy">
      <div className="header">
        <div><h1>{title}</h1><p>Browse approved {mode} or apply to {mode === 'departments' ? 'add one.' : 'add or edit a name.'}</p></div>
        <Button variant="add" onClick={event => open(event.currentTarget)}>Propose {label}</Button>
      </div>
      <div className="controls-container"><div className="search-wrapper">
        <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" /></svg>
        <Input type="search" className="search-input" aria-label={`Search by ${label.toLowerCase()} name`}
          placeholder={`Search by ${label.toLowerCase()} name`} value={search} onChange={event => setSearch(event.target.value)} />
      </div></div>
      <section id="faculty-entity-list" aria-live="polite">
        {list.isError ? <><Alert variant="warning" title={list.error.message} description={list.error instanceof ApiRequestError ? list.error.hint ?? '' : ''} />
          <Button variant="outline" onClick={() => void list.refetch()}>Retry</Button></> :
          <DataTable key={search} data={records} getRowId={record => record.id} ariaLabel={title} isLoading={list.isPending || list.isFetching}
            emptyTitle={search ? `No matching ${mode}` : `No ${mode} yet`}
            emptyDescription={search ? `Try another ${label.toLowerCase()} name.` : `Approved ${mode} will appear here.`}
            columns={[
              { key: 'name', label },
              {
                key: 'status',
                label: 'Status',
                headerClass: 'ui-table-heading-center',
                render: () => (
                  <Badge variant="success">
                    <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Approved
                  </Badge>
                ),
              },
              { key: 'action', label: 'Action', headerClass: 'ui-table-heading-center', render: record =>
                <Button variant="outline" onClick={event => open(event.currentTarget, { id: record.id, name: record.name })}>Apply to edit</Button> },
            ]} />}
      </section>
      <p className="status" role="status" />
      {selection && <ProposalForm mode={mode} record={selection.record} onClose={close} onSubmitted={() => {
        close(); setToast(`${label} proposal submitted! Awaiting administrator approval.`);
      }} />}
      <p className="muted application-footer-note">{mode === 'departments'
        ? 'New departments require admin approval. Your own department is locked in your profile.'
        : 'Programs are independent of departments. Your proposals require admin approval.'}</p>
      {toast && <Toast message={toast} />}
    </div>
  </AppShell>;
}

export function FacultyTaxonomyPage({ mode }: { mode: Mode }) {
  const { role, status, loading } = useSession();
  if (loading) return null;
  if (role !== 'faculty' || status !== 'active') return <Navigate to="/" replace />;
  return <TaxonomyProposals key={mode} mode={mode} />;
}
