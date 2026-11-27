import { useMemo, useState } from 'react';
import { FacultyStudentRegistration } from './FacultyStudentRegistration';
import { Link } from 'react-router-dom';
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
  CardSkeleton,
  useMinimumLoadingDuration,
  EmptyState,
  Badge,
  Button,
  Input,
  Select,
} from '../../components/ui';
import { useSearchStudents, type StudentSearchResult } from '../../hooks/useSearchStudents';
import { usePrograms } from '../../hooks/usePrograms';
import { useDepartments } from '../../hooks/useDepartments';
import { useTags } from '../../hooks/useTags';
import { useStudentReviews } from '../../hooks/useStudentReviews';
import { Modal } from '../../components/ui/Modal';
import { useSession } from '../../context/SessionContext';

const PAGE_SIZE = 10;

export function FacultyStudentsPage() {
  const { profile } = useSession();
  const isActiveFaculty = profile?.role === 'faculty' && profile?.status === 'active';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  const { data: programs, isPending: isProgramsPending } = usePrograms();
  const { data: departments, isPending: isDepartmentsPending } = useDepartments();
  const { data: tagsData, isPending: isTagsPending } = useTags();

  const distinctTags = useMemo(() => {
    const list = (tagsData ?? []).map((t) => t.tag);
    return [...new Set(list)].sort((a, b) => a.localeCompare(b));
  }, [tagsData]);

  const searchParams = useMemo(() => {
    return {
      query: searchTerm.trim() || undefined,
      program_id: selectedProgram || undefined,
      owner_department_id: selectedDepartment || undefined,
      tag: selectedTag || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      order: 'created_at.desc,id.asc' as const,
    };
  }, [searchTerm, selectedProgram, selectedDepartment, selectedTag, page]);

  const {
    data: students,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useSearchStudents(searchParams, {
    enabled: Boolean(isActiveFaculty),
  });
  const isLoading = useMinimumLoadingDuration(isPending || isFetching);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProgram('');
    setSelectedDepartment('');
    setSelectedTag('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedProgram || selectedDepartment || selectedTag
  );

  if (!isActiveFaculty) {
    return (
      <AppShell
        role={profile?.role === 'admin' ? 'admin' : 'faculty'}
        activeNavKey="students"
        breadcrumb={profile?.role === 'admin' ? 'Admin Portal / Student Roster' : 'Faculty Portal / Student Roster'}
      >
        <div style={{ padding: '24px 0', maxWidth: '640px' }}>
          <div
            role="alert"
            style={{
              padding: '20px 24px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
            }}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Access Restricted</h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
              The student directory and review mining tools are reserved exclusively for active, verified faculty members. Pending accounts and administrative users are restricted from querying attributed student reviews.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="faculty"
      activeNavKey="students"
      breadcrumb="Faculty Portal / Student Roster"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Student Directory &amp; Review Mining
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Search students through review-aware structured filters (program, reviewer department, competency tags).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FacultyStudentRegistration onOpen={() => setSelectedStudent(null)} />
            {hasActiveFilters && (
              <Button size="sm" variant="ghost" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            )}
            <Button size="sm" variant="secondary" disabled={isLoading} onClick={() => refetch()}>
              Refresh Roster
            </Button>
          </div>
        </div>

        {/* Multi-filter controls toolbar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--card)',
            padding: '16px',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Keyword Search */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground)' }}>
              Search Keywords
            </label>
            <Input
              placeholder="Search name, ID, or review text..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%' }}
            />
          </div>

          {/* Academic Program */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground)' }}>
              Academic Program
            </label>
            <Select
              aria-label="Filter by program"
              value={selectedProgram}
              disabled={isProgramsPending}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Programs</option>
              {programs?.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Reviewer Department */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground)' }}>
              Reviewer Department
            </label>
            <Select
              aria-label="Filter by reviewer department"
              value={selectedDepartment}
              disabled={isDepartmentsPending}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Reviewer Departments</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Competency Tag */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--foreground)' }}>
              Competency Tag
            </label>
            <Select
              aria-label="Filter by competency tag"
              value={selectedTag}
              disabled={isTagsPending}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Competency Tags</option>
              {distinctTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Error notification */}
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
            <strong>Error loading students from Prism mock:</strong> {error?.message}
          </div>
        )}

        {/* Students Data Table */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '140px' }}>Student ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Review Tags</TableHead>
                <TableHead style={{ width: '130px', textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody aria-busy={isLoading || undefined}>
              {isLoading && (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              )}

              {!isLoading && (!students || students.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} style={{ padding: '36px 0', textAlign: 'center' }}>
                    <EmptyState
                      title="No students matched your search"
                      description="Adjust your search keywords or clear active filters to view the complete roster."
                      action={
                        <Button
                          variant="empty-reset"
                          size="sm"
                          onClick={handleResetFilters}
                        >
                          Reset Filters
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                students?.map((student) => {
                  const fullName = [student.first_name, student.middle_name, student.last_name]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <TableRow key={student.id}>
                      <TableCell style={{ fontWeight: 600, fontFamily: 'var(--font-mono, monospace)' }}>
                        {student.student_id_number}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/faculty/students/${student.id}`}
                          style={{ fontWeight: 600, color: 'var(--foreground)' }}
                        >
                          {fullName}
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground, #64748b)' }}>
                          Registered via {student.registration_source === 'admin_direct' ? 'Admin Direct' : 'Faculty Application'}
                        </div>
                      </TableCell>
                      <TableCell>{student.program_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {student.visible_review_tags && student.visible_review_tags.length > 0 ? (
                            student.visible_review_tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline">
                                #{tag}
                              </Badge>
                            ))
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--muted-foreground, #94a3b8)' }}>
                              No review tags yet
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <Link
                            to={`/faculty/students/${student.id}`}
                            className="ui-btn ui-btn-primary ui-btn--sm"
                            style={{ textDecoration: 'none' }}
                          >
                            Student Detail
                          </Link>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedStudent(student)}
                          >
                            View Reviews
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        {(isLoading || (students && students.length > 0)) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--muted-foreground, #64748b)' }} role="status">
              {isLoading ? 'Loading students…' : `Showing ${students?.length ?? 0} results (Page ${page})`}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading || (students?.length ?? 0) < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Student Reviews Modal */}
      {selectedStudent && (
        <StudentReviewsDialog
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </AppShell>
  );
}

function StudentReviewsDialog({
  student,
  onClose,
}: {
  student: StudentSearchResult;
  onClose: () => void;
}) {
  const { data: reviews, isPending: rawIsPending, isFetching, isError } = useStudentReviews({
    student_id: `eq.${student.id}`,
    status: 'eq.active',
  });
  const isPending = useMinimumLoadingDuration(rawIsPending || isFetching);

  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Reviews for ${fullName}`}
      description={`${student.student_id_number} · ${student.program_name}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
        {isPending && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
        {isError && <p style={{ color: 'var(--destructive)' }}>Failed to load reviews.</p>}
        {!isPending && (!reviews || reviews.length === 0) && (
          <EmptyState
            title="No reviews yet"
            description="Be the first faculty member to submit a review for this student."
          />
        )}
        {!isPending &&
          reviews?.map((review) => (
            <div
              key={review.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px',
                backgroundColor: 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>
                  {review.author_name || 'Faculty Member'} ({review.author_department_name || 'Department'})
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.5 }}>
                {review.body_text}
              </p>
              {review.tags && review.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {review.tags.map((tag, idx) => (
                    <Badge key={idx} variant="muted">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
