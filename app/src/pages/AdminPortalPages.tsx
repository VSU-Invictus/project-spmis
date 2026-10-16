import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationQueue } from '../components/application-queue/ApplicationQueue';
import { AppShell } from '../components/navigation/AppShell';
import type { AdminNavKey } from '../components/navigation/AdminSidebar';
import type { FacultyNavKey } from '../components/navigation/FacultySidebar';
import { QUEUE_TITLES, type QueueType } from '../components/queue-modal/queues';
import { useQueueSearchParam } from '../components/queue-modal/useQueueSearchParam';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { QueueMetricsGrid } from '../components/ui/QueueMetricCard';
import { SystemActivityLog } from '../components/ui/SystemActivityLog';
import { QUEUE_FIXTURES } from '../data/queueFixtures';
import { ROSTER_STUDENTS, type RosterStudent } from '../data/rosterFixtures';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { openQueue } = useQueueSearchParam();

  const counts = {
    student: QUEUE_FIXTURES.student.length,
    department: QUEUE_FIXTURES.department.length,
    program: QUEUE_FIXTURES.program.length,
    faculty: QUEUE_FIXTURES.faculty.length,
  };

  return (
    <AppShell role="admin" activeNavKey="dashboard" breadcrumb="Admin Portal / Overview">
      <header className="ui-dashboard-intro">
        <h1>Dashboard</h1>
        <p>System-wide metrics and real-time pending queue summaries.</p>
      </header>

      <QueueMetricsGrid counts={counts} onOpenQueue={openQueue} />

      <div className="ui-dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <SystemActivityLog
          onViewAll={(e) => {
            e.preventDefault();
            navigate('/admin/audit-log');
          }}
        />
      </div>
    </AppShell>
  );
}

export function AdminApplicationViewPage({ type }: { type: QueueType }) {
  const navKeyMap: Record<QueueType, AdminNavKey> = {
    student: 'students',
    department: 'departments',
    program: 'programs',
    faculty: 'faculty',
  };

  return (
    <AppShell
      role="admin"
      activeNavKey={navKeyMap[type]}
      breadcrumb={`Admin Portal / ${QUEUE_TITLES[type]}`}
    >
      <ApplicationQueue type={type} isModal={false} />
    </AppShell>
  );
}

export function AdminEntityPage({ section }: { section: AdminNavKey }) {
  const { openQueue } = useQueueSearchParam();
  const [search, setSearch] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [students, setStudents] = useState<RosterStudent[]>(ROSTER_STUDENTS);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q)
    );
  });

  const columns: DataTableColumn<RosterStudent>[] = [
    { key: 'id', label: 'ID Number', colClass: 'ui-table-cell-mono' },
    {
      key: 'name',
      label: 'Student Name & Email',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{row.email}</div>
        </div>
      ),
    },
    { key: 'program', label: 'Program' },
    { key: 'yearLevel', label: 'Year Level' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRejectingId((prev) => (prev === row.id ? null : row.id))}
        >
          Review
        </Button>
      ),
    },
  ];

  const queueForSection: Partial<Record<AdminNavKey, QueueType>> = {
    students: 'student',
    departments: 'department',
    programs: 'program',
    faculty: 'faculty',
  };

  const linkedQueue = queueForSection[section];

  return (
    <AppShell
      role="admin"
      activeNavKey={section}
      breadcrumb={`Admin Portal / ${section.charAt(0).toUpperCase() + section.slice(1)}`}
    >
      <header className="ui-dashboard-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ textTransform: 'capitalize' }}>{section.replace('-', ' ')}</h1>
          <p>Manage records, filter entries, and review pending applications.</p>
        </div>
        {linkedQueue && (
          <Button variant="primary" onClick={() => openQueue(linkedQueue)}>
            Open {QUEUE_TITLES[linkedQueue]}
          </Button>
        )}
      </header>

      <div style={{ maxWidth: '360px', marginBottom: '12px' }}>
        <Input
          aria-label={`Search ${section}`}
          placeholder={`Search ${section}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        getRowId={(r) => r.id}
        selectable
        showSelectAllButton
        entityName="records"
        activeRejectionRowId={rejectingId}
        onCancelRejection={() => setRejectingId(null)}
        onConfirmRejection={(_reason, ids) => {
          const drop = new Set(ids);
          setStudents((prev) => prev.filter((s) => !drop.has(s.id)));
          setRejectingId(null);
        }}
      />
    </AppShell>
  );
}

export function FacultyPortalPage({ section = 'dashboard' }: { section?: FacultyNavKey }) {
  return (
    <AppShell
      role="faculty"
      activeNavKey={section}
      breadcrumb={`Faculty Portal / ${section.charAt(0).toUpperCase() + section.slice(1)}`}
    >
      <header className="ui-dashboard-intro">
        <h1 style={{ textTransform: 'capitalize' }}>Faculty {section}</h1>
        <p>Manage student evaluations, academic programs, and AI-assisted reviews.</p>
      </header>
      <SystemActivityLog title="Recent Faculty Activity" subtitle="Latest Reviews" />
    </AppShell>
  );
}

