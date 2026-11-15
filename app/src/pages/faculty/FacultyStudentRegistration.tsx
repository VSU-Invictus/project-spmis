import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { Button, FacultyProposalDialog, Input, Select, Toast } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useApprovedProgramOptions, useSubmitApplication } from '../../hooks';
import { studentSchema } from '../../lib/validation/student';
import { ApiRequestError } from '../../lib/api';
import './FacultyStudentRegistration.css';

function RegistrationForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const { role, status, loading } = useSession();
  const programs = useApprovedProgramOptions();
  const submission = useSubmitApplication();
  const submitting = useRef(false);
  const [requestError, setRequestError] = useState<Error | null>(null);
  const form = useForm<z.input<typeof studentSchema>, unknown, z.output<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { student_id_number: '', first_name: '', last_name: '', middle_name: '', program_id: '' },
  });
  const choices = (programs.data ?? []).filter(program => program.status === 'approved');
  const pending = form.formState.isSubmitting || submission.isPending;
  const allowed = !loading && role === 'faculty' && status === 'active';
  const close = () => { if (!submitting.current) onClose(); };
  const submit = form.handleSubmit(async values => {
    if (!allowed || submitting.current || programs.isPending || programs.isError) return;
    setRequestError(null);
    if (!choices.some(program => program.id === values.program_id)) {
      form.setError('program_id', { message: 'Choose an approved program.' });
      return;
    }
    submitting.current = true;
    try {
      const applications = await submission.mutateAsync({ type: 'student_registration', payload: values });
      if (!applications.some(application => application.type === 'student_registration' && application.status === 'pending')) {
        throw new Error('The server did not return a pending registration. Check your applications before trying again.');
      }
      form.reset();
      onSubmitted();
    } catch (error) {
      setRequestError(error instanceof Error ? error : new Error('Unable to submit the registration application.'));
    } finally { submitting.current = false; }
  });
  const errors = form.formState.errors;
  return <FacultyProposalDialog open onClose={close} id="register-student-modal" className="register-modal"
    title="Register a student" subtitle="Apply to add a new student to the independent SPMIS roster.">
    <div className="ui-alert ui-alert--warning" role="region" aria-label="Registration Verification Notice">
      <svg className="ui-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="ui-alert-content"><span className="ui-alert-desc">Registration requires physical verification by an administrator outside the system. Your application stays pending until the admin approves it.</span></div>
    </div>
    <form id="registration-form" className="modal-form" noValidate onSubmit={submit} aria-busy={pending}>
      <Input id="student-id" label="Student ID number" aria-required="true" placeholder="e.g. 24-1-00006" autoComplete="off"
        disabled={pending} {...form.register('student_id_number')} error={errors.student_id_number?.message} autoFocus />
      <div className="ui-form-grid ui-form-grid--2">
        <Input id="first-name" label="First name" aria-required="true" placeholder="e.g. Alex" autoComplete="off"
          disabled={pending} {...form.register('first_name')} error={errors.first_name?.message} />
        <Input id="last-name" label="Last name" aria-required="true" placeholder="e.g. Morgan" autoComplete="off"
          disabled={pending} {...form.register('last_name')} error={errors.last_name?.message} />
      </div>
      <Input id="middle-name" label={<>Middle name <span className="ui-form-optional">(optional)</span></>}
        placeholder="e.g. Taylor" autoComplete="off" disabled={pending} {...form.register('middle_name')} error={errors.middle_name?.message} />
      <div className="ui-form-group">
        <Select id="program" label="Program" aria-required="true" disabled={pending || programs.isPending || programs.isError}
          {...form.register('program_id')} error={Boolean(errors.program_id)} aria-describedby="registration-program-hint registration-program-error">
          <option value="" disabled>Select Program</option>
          {choices.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}
        </Select>
        <span className="ui-form-hint" id="registration-program-hint">Choose an approved program. A missing program can be proposed from the Programs page.</span>
        <span className="ui-form-error" id="registration-program-error" role="status">{errors.program_id && 'Choose an approved program.'}</span>
        {programs.isPending && <p role="status">Loading approved programs…</p>}
        {programs.isError && <>
          <p className="ui-form-error" role="alert">{programs.error.message} {programs.error instanceof ApiRequestError && programs.error.hint}</p>
          <Button variant="outline" onClick={() => void programs.refetch()}>Retry programs</Button>
        </>}
        {!programs.isPending && !programs.isError && choices.length === 0 &&
          <p className="ui-form-error" role="status">No approved programs are available. A program must be approved before you can submit this registration.</p>}
      </div>
      <p className="ui-form-error" id="registration-status" role="status" aria-live="polite">
        {requestError?.message} {requestError instanceof ApiRequestError && requestError.hint}
      </p>
      <div className="modal-actions">
        <Button variant="outline" onClick={close} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={!allowed || pending || programs.isPending || programs.isError || choices.length === 0}>Submit application</Button>
      </div>
    </form>
  </FacultyProposalDialog>;
}

/** Canonical M1 entry point: the Students page with ?register=true. */
export function FacultyStudentRegistration({ onOpen }: { onOpen?: () => void }) {
  const { role, status, loading } = useSession();
  const [params, setParams] = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const allowed = !loading && role === 'faculty' && status === 'active';
  const open = allowed && (params.has('register') || params.get('modal') === 'register');
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) onOpenRef.current?.();
    else if (wasOpen.current) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const close = () => setParams(previous => {
    const next = new URLSearchParams(previous);
    next.delete('register');
    if (next.get('modal') === 'register') next.delete('modal');
    return next;
  });
  if (!allowed) return null;
  return <>
    <Button variant="add" ref={trigger} onClick={() => setParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('register', 'true');
      return next;
    })}>Register Student</Button>
    {open && <RegistrationForm onClose={close} onSubmitted={() => {
      setToast('Student registration application submitted! Awaiting administrator approval.');
      close();
    }} />}
    {toast && <Toast id="registration-success-toast" message={toast} />}
  </>;
}
