import { useState } from 'react';
import { AppShell } from '../../components/navigation/AppShell';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableRowSkeleton,
  EmptyState,
  Badge,
  Button,
} from '../../components/ui';
import { useDepartments } from '../../hooks/useDepartments';
import { usePrograms } from '../../hooks/usePrograms';

export function AdminTaxonomyPage({ mode = 'departments' }: { mode?: 'departments' | 'programs' }) {
  const [activeTab, setActiveTab] = useState<'departments' | 'programs'>(mode);

  const {
    data: departments,
    isPending: isDeptsPending,
    isError: isDeptsError,
    error: deptsError,
    refetch: refetchDepts,
  } = useDepartments();

  const {
    data: programs,
    isPending: isProgsPending,
    isError: isProgsError,
    error: progsError,
    refetch: refetchProgs,
  } = usePrograms();

  const isPending = activeTab === 'departments' ? isDeptsPending : isProgsPending;
  const isError = activeTab === 'departments' ? isDeptsError : isProgsError;
  const currentError = activeTab === 'departments' ? deptsError : progsError;

  return (
    <AppShell
      role="admin"
      activeNavKey={activeTab}
      breadcrumb={`Admin Portal / ${activeTab === 'departments' ? 'Academic Departments' : 'Degree Programs'}`}
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Academic Taxonomy Management
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Administer departments and academic programs configured in Prism mock API.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={activeTab === 'departments' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('departments')}
            >
              Departments ({departments?.length ?? 0})
            </Button>
            <Button
              variant={activeTab === 'programs' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('programs')}
            >
              Programs ({programs?.length ?? 0})
            </Button>
            <Button
              variant="outline"
              onClick={() => (activeTab === 'departments' ? refetchDepts() : refetchProgs())}
            >
              Refresh
            </Button>
          </div>
        </div>

        {isError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
              fontSize: '14px',
            }}
          >
            <strong>Prism Mock Error:</strong> {currentError?.message}
          </div>
        )}

        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '120px' }}>Reference ID</TableHead>
                <TableHead>Title / Name</TableHead>
                <TableHead style={{ width: '120px' }}>Status</TableHead>
                <TableHead style={{ width: '160px' }}>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <>
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                  <TableRowSkeleton columns={4} />
                </>
              )}

              {activeTab === 'departments' &&
                !isPending &&
                (!departments || departments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} style={{ padding: '36px 0', textAlign: 'center' }}>
                      <EmptyState
                        title="No departments found"
                        description="Departments configured in the contract will appear here."
                      />
                    </TableCell>
                  </TableRow>
                )}

              {activeTab === 'departments' &&
                !isPending &&
                departments?.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell style={{ fontWeight: 600, fontFamily: 'var(--font-mono, monospace)', fontSize: '13px' }}>
                      {dept.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{dept.name}</TableCell>
                    <TableCell>
                      <Badge variant={dept.status === 'approved' ? 'success' : 'warning'}>
                        {dept.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {new Date(dept.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}

              {activeTab === 'programs' &&
                !isPending &&
                (!programs || programs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} style={{ padding: '36px 0', textAlign: 'center' }}>
                      <EmptyState
                        title="No programs found"
                        description="Degree programs configured in the contract will appear here."
                      />
                    </TableCell>
                  </TableRow>
                )}

              {activeTab === 'programs' &&
                !isPending &&
                programs?.map((prog) => (
                  <TableRow key={prog.id}>
                    <TableCell style={{ fontWeight: 600, fontFamily: 'var(--font-mono, monospace)', fontSize: '13px' }}>
                      {prog.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>{prog.name}</TableCell>
                    <TableCell>
                      <Badge variant={prog.status === 'approved' ? 'success' : 'warning'}>
                        {prog.status}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {new Date(prog.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppShell>
  );
}
