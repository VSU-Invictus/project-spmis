import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import { Alert, Badge, Button, DataTable, Input } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useOwnApplications, type ApprovalQueueItem } from '../../hooks/useApprovalQueueItems';
import { ApiRequestError } from '../../lib/api';
import './FacultyApplicationsPage.css';

function applicationType(item: ApprovalQueueItem) {
  switch (item.type) {
    case 'faculty_account': return 'Faculty account';
    case 'student_registration': return 'Student registration';
    case 'program_proposal': return item.payload.program_id ? 'Program edit' : 'Program proposal';
    case 'department_proposal': return item.payload.department_id ? 'Department edit' : 'Department proposal';
  }
}

function recordName(item: ApprovalQueueItem) {
  switch (item.type) {
    case 'faculty_account': return item.payload.full_name;
    case 'student_registration': return [item.payload.first_name, item.payload.middle_name, item.payload.last_name].filter(Boolean).join(' ');
    default: return item.payload.name;
  }
}

function ApplicationHistory({ profileId }: { profileId: string }) {
  const applications = useOwnApplications(profileId);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const records = (applications.data ?? []).filter(item => (!status || item.status === status) &&
    `${applicationType(item)} ${recordName(item)}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <AppShell role="faculty" activeNavKey="applications" breadcrumb="Faculty Portal / Applications">
    <div className="faculty-applications">
      <div className="header"><div><h1>Your applications</h1>
        <p>Track your student registrations, program proposals, and department proposals.</p></div></div>
      <div className="controls-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33" /><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" /></svg>
          <Input type="search" className="search-input" aria-label="Search record name or application type"
            placeholder="Search record name or application type" value={search} onChange={event => setSearch(event.target.value)} />
        </div>
        <div className="controls-actions"><div className="dropdown-container status">
          <select className="dropdown-select" aria-label="Filter by application status" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="">Status: All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
          <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div></div>
      </div>
      <section id="faculty-application-list" aria-live="polite">
        {applications.isError ? <><Alert variant="warning" title={applications.error.message}
          description={applications.error instanceof ApiRequestError ? applications.error.hint ?? '' : ''} />
          <Button variant="outline" onClick={() => void applications.refetch()}>Retry</Button></> :
          <DataTable key={`${search}:${status}`} data={records} getRowId={item => item.id} ariaLabel="Your applications" isLoading={applications.isPending || applications.isFetching}
            emptyTitle={search || status ? 'No matching applications' : 'No applications yet'}
            emptyDescription={search || status ? 'Try another search or status.' : 'Your submissions will appear here.'}
            columns={[
              { key: 'type', label: 'Application type', render: applicationType },
              { key: 'record', label: 'Requested record', render: recordName },
              { key: 'created_at', label: 'Submitted', render: item => <time dateTime={item.created_at}>{item.created_at.slice(0, 10)}</time> },
              { key: 'status', label: 'Status', headerClass: 'ui-table-heading-center', render: item =>
                <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge> },
              { key: 'reason', label: 'Decision / reason', render: item => item.status === 'pending' ? 'Awaiting admin review'
                : item.decision_reason || (item.status === 'rejected' ? 'Rejection reason unavailable.' : 'Approved by admin') },
            ]} />}
      </section>
      <p className="muted application-footer-note">Only your submissions appear here. Admin decisions include a reason when a request is rejected. A resubmission is a new application.</p>
    </div>
  </AppShell>;
}

export function FacultyApplicationsPage() {
  const { role, status, loading, profile } = useSession();
  if (loading) return null;
  if (role !== 'faculty' || status !== 'active' || !profile) return <Navigate to="/" replace />;
  return <ApplicationHistory key={profile.id} profileId={profile.id} />;
}
