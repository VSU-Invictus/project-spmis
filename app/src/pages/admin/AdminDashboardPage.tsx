import { BookOpen, Landmark, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/navigation/AppShell';
import { Badge, Table, TableContainer } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useAdminQueueBrowse } from '../../hooks/useAdminQueueBrowse';
import type { ApprovalQueueItem } from '../../hooks/useApprovalQueueItems';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useDepartmentOptions } from '../../hooks/useDepartments';
import { useProgramOptions } from '../../hooks/usePrograms';

const categories = {
  student_registration: { queue: 'student', title: 'Students', label: 'Student', badge: 'warning', Icon: Users },
  department_proposal: { queue: 'department', title: 'Departments', label: 'Department', badge: 'purple', Icon: Landmark },
  program_proposal: { queue: 'program', title: 'Programs', label: 'Program', badge: 'cyan', Icon: BookOpen },
  faculty_account: { queue: 'faculty', title: 'Faculty', label: 'Faculty', badge: 'info', Icon: UserRound },
} as const;

function QueuePreviewRow({ item, departments, programs }: {
  item: ApprovalQueueItem;
  departments?: { id: string; name: string }[];
  programs?: { id: string; name: string }[];
}) {
  const category = categories[item.type];
  let title: string;
  let context: string | undefined;
  switch (item.type) {
    case 'faculty_account':
      title = item.payload.full_name;
      context = item.payload.proposed_department_name ?? departments?.find(d => d.id === item.payload.department_id)?.name;
      break;
    case 'student_registration':
      title = [item.payload.first_name, item.payload.middle_name, item.payload.last_name].filter(Boolean).join(' ');
      context = programs?.find(p => p.id === item.payload.program_id)?.name;
      break;
    case 'program_proposal':
      title = item.payload.name;
      context = item.payload.program_id ? 'Edit Existing' : 'New Addition';
      break;
    case 'department_proposal':
      title = item.payload.name;
      context = item.payload.department_id ? 'Edit Existing' : 'New Addition';
      break;
  }
  return <tr>
    <td><Badge variant={category.badge}>{category.label}</Badge></td>
    <td>{title || 'Unavailable'}</td><td>{context || '—'}</td>
    <td className="ui-dashboard-date">{item.created_at.slice(0, 10)}</td>
    <td><Link className="ui-link-neutral ui-dashboard-review" to={`?queue=${category.queue}`}>Review →</Link></td>
  </tr>;
}

function DashboardOverview({ profileId }: { profileId: string }) {
  const queues = [
    { ...categories.student_registration, result: useAdminQueueBrowse('student_registration', profileId) },
    { ...categories.department_proposal, result: useAdminQueueBrowse('department_proposal', profileId) },
    { ...categories.program_proposal, result: useAdminQueueBrowse('program_proposal', profileId) },
    { ...categories.faculty_account, result: useAdminQueueBrowse('faculty_account', profileId) },
  ];
  const pending = queues.flatMap(({ result }) => result.data ?? [])
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id))
    .slice(0, 4);
  const departments = useDepartmentOptions({ enabled: pending.some(item => item.type === 'faculty_account' && Boolean(item.payload.department_id)) });
  const programs = useProgramOptions({ enabled: pending.some(item => item.type === 'student_registration') });
  const audits = useAuditLogs({ limit: 3, order: 'created_at.desc,id.asc' });
  const loading = queues.some(({ result }) => result.isPending);
  const failed = queues.some(({ result }) => result.isError);

  return <AppShell role="admin" activeNavKey="dashboard" showHeaderThemeToggle={false}>
    <header className="ui-dashboard-intro">
      <h1>Dashboard</h1><p>System-wide metrics and real-time pending queue summaries.</p>
    </header>
    <section className="ui-dashboard-overview" aria-labelledby="pending-items-heading">
      <h2 id="pending-items-heading">Pending Action Items</h2>
      <div className="ui-dashboard-metrics">
        {queues.map(({ queue, title, Icon, result }) =>
          <Link key={queue} to={`?queue=${queue}`} className="ui-card ui-card-interactive ui-dashboard-metric">
            <span className="ui-dashboard-metric-top"><span className="ui-card-title">{title}</span>
              <span className={`ui-dashboard-icon ui-dashboard-icon--${queue}`} aria-hidden="true"><Icon /></span>
            </span>
            <span className="ui-dashboard-metric-bottom">
              <strong>{result.isError ? '—' : result.data?.length ?? '…'}</strong>
              <span className="ui-text-muted ui-dashboard-metric-action">Requires review →</span>
            </span>
          </Link>)}
      </div>
    </section>
    <div className="ui-dashboard-grid">
      <section className="ui-card ui-dashboard-panel ui-dashboard-queue-panel" aria-labelledby="queue-heading">
        <div className="ui-dashboard-panel-header">
          <h2 id="queue-heading">Pending Approval Queue</h2><span>Requires System-Admin Action</span>
        </div>
        {failed && <p role="alert">Some application queues could not be loaded.</p>}
        {(departments.isError || programs.isError) && <p role="alert">Some department or program names could not be loaded.</p>}
        <TableContainer className="ui-dashboard-table-wrap" role="region" aria-label="Pending approval applications" tabIndex={0}>
          <Table className="ui-dashboard-table" aria-label="Pending approval applications">
            <thead><tr>{['Type', 'Applicant / Title', 'Department / Context', 'Submitted', 'Action'].map(label =>
              <th key={label} scope="col">{label}</th>)}</tr></thead>
            <tbody>
              {pending.map(item => <QueuePreviewRow key={item.id} item={item} departments={departments.data} programs={programs.data} />)}
              {!pending.length && !failed && <tr><td colSpan={5}>{loading ? 'Loading applications…' : 'No pending applications.'}</td></tr>}
            </tbody>
          </Table>
        </TableContainer>
      </section>
      <aside className="ui-card ui-dashboard-panel ui-dashboard-activity-panel" aria-labelledby="activity-heading">
        <div className="ui-dashboard-panel-header"><h2 id="activity-heading">System Activity Log</h2><span>Recent Audits</span></div>
        <div className="ui-dashboard-activity-list">
          {audits.isPending && <p role="status">Loading audit events…</p>}
          {audits.isError && <p role="alert">Audit events could not be loaded.</p>}
          {audits.isSuccess && !audits.data.length && <p>No recent audit events.</p>}
          {audits.data?.slice(0, 3).map(event => <article key={event.id} className="ui-dashboard-activity-item">
            <div><h3>{event.action}</h3><time className="ui-dashboard-time" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></div>
            <p>{event.actor_role} · {event.entity_type}</p>
          </article>)}
        </div>
        <div className="ui-dashboard-activity-footer"><Link className="ui-link-neutral" to="/admin/audit-log">View All Logs →</Link></div>
      </aside>
    </div>
  </AppShell>;
}

export function AdminDashboardPage() {
  const { profile } = useSession();
  return profile?.role === 'admin' && profile.status === 'active' ? <DashboardOverview profileId={profile.id} /> : null;
}
