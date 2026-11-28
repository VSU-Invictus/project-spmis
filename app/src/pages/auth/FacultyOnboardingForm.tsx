import { useState, type FormEvent } from 'react';
import { useSession } from '../../context/SessionContext';
import { useCompleteFacultyOnboarding, useOnboardingDepartments } from '../../hooks';
import { ApiRequestError } from '../../lib/api';

const NAME_LIMIT = 200;

function onboardingErrorMessage(error: Error): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) return 'A faculty profile already exists for this account. Reload the page to see its status.';
    if (error.status === 403) return 'A verified Google account is required to complete faculty registration.';
    if (error.status === 422) return error.message || 'The faculty name or department is invalid.';
  }
  return error.message || 'Faculty registration could not be completed. Try again.';
}

/** Shown to a verified Google user who has no faculty_profiles row yet. */
export function FacultyOnboardingForm() {
  const { session, syncProfile, refreshProfile } = useSession();
  const metadata = session?.user?.user_metadata as Record<string, unknown> | undefined;
  const suggestedName = typeof metadata?.full_name === 'string' ? metadata.full_name
    : typeof metadata?.name === 'string' ? metadata.name : '';
  const [fullName, setFullName] = useState(suggestedName);
  const [departmentId, setDepartmentId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ full_name?: string; department_id?: string }>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const departments = useOnboardingDepartments();
  const complete = useCompleteFacultyOnboarding();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (complete.isPending) return;
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.full_name = 'Enter your full name.';
    else if (fullName.length > NAME_LIMIT) errors.full_name = `Full name must be at most ${NAME_LIMIT} characters.`;
    if (!departments.data?.some(department => department.id === departmentId)) errors.department_id = 'Select an approved department.';
    setFieldErrors(errors);
    setRequestError(null);
    if (Object.keys(errors).length) return;
    try {
      const created = await complete.mutateAsync({ full_name: fullName.trim(), department_id: departmentId });
      syncProfile(created);
      void refreshProfile().catch(() => undefined);
    } catch (error) {
      setRequestError(onboardingErrorMessage(error instanceof Error ? error : new Error(String(error))));
    }
  }

  return (
    <form className="onboarding-form" aria-labelledby="verification-title" noValidate onSubmit={event => void submit(event)}>
      <h1 id="verification-title" className="verification-title">Complete Faculty Registration</h1>
      <p className="verification-desc-main">
        Tell us your name and department. An administrator will review your account before you can access the portal.
      </p>
      <div className="ui-form-group">
        <label htmlFor="onboardingFullName" className="ui-form-label">Full Name</label>
        <input id="onboardingFullName" className="ui-input" value={fullName} maxLength={NAME_LIMIT + 1}
          disabled={complete.isPending} aria-required="true" aria-invalid={Boolean(fieldErrors.full_name) || undefined}
          onChange={event => setFullName(event.target.value)} />
        {fieldErrors.full_name && <span className="ui-field-error" role="alert">{fieldErrors.full_name}</span>}
      </div>
      <div className="ui-form-group">
        <label htmlFor="onboardingDepartment" className="ui-form-label">Department</label>
        <select id="onboardingDepartment" className="ui-input" value={departmentId} aria-required="true"
          disabled={complete.isPending || departments.isPending || departments.isError}
          aria-invalid={Boolean(fieldErrors.department_id) || undefined}
          onChange={event => setDepartmentId(event.target.value)}>
          <option value="" disabled>{departments.isPending ? 'Loading departments…' : 'Select Department'}</option>
          {departments.data?.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}
        </select>
        {fieldErrors.department_id && <span className="ui-field-error" role="alert">{fieldErrors.department_id}</span>}
        {departments.isError && <span className="ui-field-error" role="alert">
          {onboardingErrorMessage(departments.error)}{' '}
          <button type="button" className="link-button" onClick={() => void departments.refetch()}>Retry</button>
        </span>}
      </div>
      {requestError && <p className="ui-field-error" role="alert">{requestError}</p>}
      <button className="verification-back-button" type="submit" disabled={complete.isPending || departments.isPending}>
        {complete.isPending ? 'Submitting…' : 'Submit Registration'}
      </button>
    </form>
  );
}
